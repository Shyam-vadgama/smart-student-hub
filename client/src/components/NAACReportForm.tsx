import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { FileText, ChevronRight, ChevronLeft } from 'lucide-react';

interface NAACReportFormProps {
  onClose: () => void;
}

const NAACReportForm: React.FC<NAACReportFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    academicYear: '',
    reportType: 'naac' as 'naac' | 'nba' | 'both',
    
    // Student Data
    studentData: {
      totalAdmitted: 0,
      categoryWise: { general: 0, obc: 0, sc: 0, st: 0, international: 0 },
      dropoutRate: 0,
      passPercentage: 0,
    },
    
    // Achievements
    achievements: {
      hackathons: 0,
      researchPapers: 0,
      startups: 0,
    },
    
    // Academic Records
    academicRecords: {
      averageAttendance: 0,
      passRate: 0,
    },
    
    // Placement Data
    placementData: {
      placementPercentage: 0,
      totalPlaced: 0,
      highestPackage: 0,
      averagePackage: 0,
      internships: 0,
    },
    
    // Faculty Data
    facultyData: {
      totalFaculty: 0,
      phdHolders: 0,
      mtechHolders: 0,
      studentTeacherRatio: 0,
    },
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/naac-reports', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ NAAC Report created successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/naac-reports'] });
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Unknown error';
      
      // Show user-friendly message for common errors
      if (errorMessage.includes('college')) {
        toast({ 
          title: 'College Not Assigned', 
          description: 'Your account must be assigned to a college. Please contact admin.', 
          variant: 'destructive' 
        });
      } else if (errorMessage.includes('department')) {
        toast({ 
          title: 'Department Not Assigned', 
          description: 'Your account must be assigned to a department. Please contact admin.', 
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Error creating report', 
          description: errorMessage, 
          variant: 'destructive' 
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReportMutation.mutate(formData);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const updateField = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [field]: value
      }
    }));
  };

  const updateNestedField = (section: string, subsection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [subsection]: {
          ...(prev as any)[section][subsection],
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Create NAAC Report</h2>
            <p className="text-sm text-gray-600">Step {step} of 6</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </h3>
              
              <div>
                <Label>Academic Year *</Label>
                <Input
                  type="text"
                  placeholder="2023-24"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Report Type *</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={formData.reportType}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value as any })}
                >
                  <option value="naac">NAAC Only</option>
                  <option value="nba">NBA Only</option>
                  <option value="both">Both NAAC & NBA</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Student Data */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Student Profile & Enrollment</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Admitted</Label>
                  <Input
                    type="number"
                    value={formData.studentData.totalAdmitted}
                    onChange={(e) => updateField('studentData', 'totalAdmitted', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Pass Percentage</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.studentData.passPercentage}
                    onChange={(e) => updateField('studentData', 'passPercentage', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Category-wise Distribution</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">General</Label>
                    <Input
                      type="number"
                      value={formData.studentData.categoryWise.general}
                      onChange={(e) => updateNestedField('studentData', 'categoryWise', 'general', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">OBC</Label>
                    <Input
                      type="number"
                      value={formData.studentData.categoryWise.obc}
                      onChange={(e) => updateNestedField('studentData', 'categoryWise', 'obc', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">SC</Label>
                    <Input
                      type="number"
                      value={formData.studentData.categoryWise.sc}
                      onChange={(e) => updateNestedField('studentData', 'categoryWise', 'sc', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">ST</Label>
                    <Input
                      type="number"
                      value={formData.studentData.categoryWise.st}
                      onChange={(e) => updateNestedField('studentData', 'categoryWise', 'st', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">International</Label>
                    <Input
                      type="number"
                      value={formData.studentData.categoryWise.international}
                      onChange={(e) => updateNestedField('studentData', 'categoryWise', 'international', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Dropout Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.studentData.dropoutRate}
                  onChange={(e) => updateField('studentData', 'dropoutRate', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {/* Step 3: Achievements */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Student Achievements</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hackathons Participated</Label>
                  <Input
                    type="number"
                    value={formData.achievements.hackathons}
                    onChange={(e) => updateField('achievements', 'hackathons', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Research Papers</Label>
                  <Input
                    type="number"
                    value={formData.achievements.researchPapers}
                    onChange={(e) => updateField('achievements', 'researchPapers', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Startups Founded</Label>
                  <Input
                    type="number"
                    value={formData.achievements.startups}
                    onChange={(e) => updateField('achievements', 'startups', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Academic Records */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academic Records</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Average Attendance (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.academicRecords.averageAttendance}
                    onChange={(e) => updateField('academicRecords', 'averageAttendance', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Pass Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.academicRecords.passRate}
                    onChange={(e) => updateField('academicRecords', 'passRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Placement Data */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Placement & Internship Data</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Placement Percentage</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.placementData.placementPercentage}
                    onChange={(e) => updateField('placementData', 'placementPercentage', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Total Placed</Label>
                  <Input
                    type="number"
                    value={formData.placementData.totalPlaced}
                    onChange={(e) => updateField('placementData', 'totalPlaced', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Highest Package (LPA)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.placementData.highestPackage}
                    onChange={(e) => updateField('placementData', 'highestPackage', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Average Package (LPA)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.placementData.averagePackage}
                    onChange={(e) => updateField('placementData', 'averagePackage', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Internships</Label>
                  <Input
                    type="number"
                    value={formData.placementData.internships}
                    onChange={(e) => updateField('placementData', 'internships', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Faculty Data */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Faculty Data</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Faculty</Label>
                  <Input
                    type="number"
                    value={formData.facultyData.totalFaculty}
                    onChange={(e) => updateField('facultyData', 'totalFaculty', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>PhD Holders</Label>
                  <Input
                    type="number"
                    value={formData.facultyData.phdHolders}
                    onChange={(e) => updateField('facultyData', 'phdHolders', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>MTech Holders</Label>
                  <Input
                    type="number"
                    value={formData.facultyData.mtechHolders}
                    onChange={(e) => updateField('facultyData', 'mtechHolders', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Student-Teacher Ratio</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.facultyData.studentTeacherRatio}
                    onChange={(e) => updateField('facultyData', 'studentTeacherRatio', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              {step < 6 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={createReportMutation.isPending}>
                  {createReportMutation.isPending ? 'Creating...' : 'Create Report'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NAACReportForm;
