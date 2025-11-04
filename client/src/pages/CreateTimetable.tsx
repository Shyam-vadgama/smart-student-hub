import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Classroom, Subject, User } from '@shared/schema';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CreateTimetable: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch classrooms for the HOD's department
  const { data: classrooms, isLoading: isLoadingClassrooms } = useQuery<Classroom[]> ({
    queryKey: ['/api/classrooms', user?.department],
    queryFn: () => {
      if (!user?.department) return [];
      const url = `/api/classrooms?department=${user.department}`;
      return apiRequest('GET', url).then((res) => res.json());
    },
    enabled: !!user?.department,
  });

  // Fetch subjects for the HOD's department
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<Subject[]> ({
    queryKey: ['/api/subjects'],
    queryFn: () => apiRequest('GET', '/api/subjects').then((res) => res.json()),
  });

  // Fetch faculty for the HOD's department
  const { data: facultyMembers, isLoading: isLoadingFaculty } = useQuery<User[]> ({
    queryKey: ['/api/faculty/hod'],
    queryFn: () => apiRequest('GET', '/api/faculty/hod').then((res) => res.json()),
  });

  // Create timetable mutation
  const createTimetableMutation = useMutation({
    mutationFn: (data: { classroom: string; subject: string; faculty: string; day: string; startTime: string; endTime: string }) =>
      apiRequest('POST', '/api/timetables', data),
    onSuccess: () => {
      toast({
        title: 'Timetable entry created successfully',
        description: 'New slot has been added to the timetable.',
      });
      setSelectedClassroom('');
      setSelectedSubject('');
      setSelectedFaculty('');
      setSelectedDay('');
      setStartTime('');
      setEndTime('');
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ['/api/timetables'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating timetable entry',
        description: error.message || 'An error occurred while creating the timetable entry.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassroom || !selectedSubject || !selectedFaculty || !selectedDay || !startTime || !endTime) {
      toast({
        title: 'Validation Error',
        description: 'All fields are required.',
        variant: 'destructive',
      });
      return;
    }

    if (startTime >= endTime) {
      toast({
        title: 'Validation Error',
        description: 'Start time must be before end time.',
        variant: 'destructive',
      });
      return;
    }

    createTimetableMutation.mutate({ 
      classroom: selectedClassroom,
      subject: selectedSubject,
      faculty: selectedFaculty,
      day: selectedDay,
      startTime,
      endTime,
    });
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Manage Timetable"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Timetable Management</h1>
              <p className="text-gray-600">Create and view class schedules</p>
            </div>

            <div className="mb-12">
              <div className="flex justify-end mb-6">
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Timetable Entry
                </Button>
              </div>

              {/* Existing Timetable View (Placeholder) */}
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Timetable Entries Yet</h3>
                <p className="text-gray-500 mb-4">Create your first timetable entry.</p>
              </div>
            </div>

            {/* Create Timetable Modal/Form */}
            {showCreateForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Create New Timetable Entry</h2>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowCreateForm(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Classroom Selection */}
                      <div>
                        <label htmlFor="classroom" className="block text-sm font-medium text-gray-700 mb-1">
                          Classroom <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="classroom"
                          value={selectedClassroom}
                          onChange={(e) => setSelectedClassroom(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                          required
                        >
                          <option value="">Select Classroom</option>
                          {isLoadingClassrooms ? (
                            <option disabled>Loading classrooms...</option>
                          ) : classrooms && classrooms.length > 0 ? (
                            classrooms.map((room) => (
                              <option key={room._id} value={room._id}>
                                {room.name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No classrooms available</option>
                          )}
                        </select>
                      </div>

                      {/* Subject Selection */}
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="subject"
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                          required
                        >
                          <option value="">Select Subject</option>
                          {isLoadingSubjects ? (
                            <option disabled>Loading subjects...</option>
                          ) : subjects && subjects.length > 0 ? (
                            subjects.map((subj) => (
                              <option key={subj._id} value={subj._id}>
                                {subj.name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No subjects available</option>
                          )}
                        </select>
                      </div>

                      {/* Faculty Selection */}
                      <div>
                        <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-1">
                          Faculty <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="faculty"
                          value={selectedFaculty}
                          onChange={(e) => setSelectedFaculty(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                          required
                        >
                          <option value="">Select Faculty</option>
                          {isLoadingFaculty ? (
                            <option disabled>Loading faculty...</option>
                          ) : facultyMembers && facultyMembers.length > 0 ? (
                            facultyMembers.map((fac) => (
                              <option key={fac._id} value={fac._id}>
                                {fac.name} ({fac.email})
                              </option>
                            ))
                          ) : (
                            <option disabled>No faculty available</option>
                          )}
                        </select>
                      </div>

                      {/* Day of Week */}
                      <div>
                        <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                          Day <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="day"
                          value={selectedDay}
                          onChange={(e) => setSelectedDay(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                          required
                        >
                          <option value="">Select Day</option>
                          {DAYS_OF_WEEK.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Start Time */}
                      <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          id="startTime"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                          required
                        />
                      </div>

                      {/* End Time */}
                      <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          id="endTime"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                          required
                        />
                      </div>

                      {/* Submit and Cancel Buttons */}
                      <div className="pt-4 flex flex-col sm:flex-row-reverse sm:space-x-4 space-y-3 sm:space-y-0 sm:space-x-reverse">
                        <Button
                          type="submit"
                          className="w-full sm:w-auto"
                          disabled={createTimetableMutation.isPending}
                        >
                          {createTimetableMutation.isPending ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Creating...
                            </>
                          ) : (
                            'Create Entry'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => setShowCreateForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateTimetable;
