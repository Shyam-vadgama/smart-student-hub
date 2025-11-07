import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface NAACReportViewProps {
  report: any;
  onClose: () => void;
}

const NAACReportView: React.FC<NAACReportViewProps> = ({ report, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              {report.reportType.toUpperCase()} Report - {report.academicYear}
            </h2>
            <p className="text-sm text-gray-600">
              Status: <span className="font-semibold">{report.status}</span>
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Student Data */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Student Profile & Enrollment</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Admitted</p>
                <p className="text-lg font-semibold">{report.studentData?.totalAdmitted || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pass Percentage</p>
                <p className="text-lg font-semibold">{report.studentData?.passPercentage || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dropout Rate</p>
                <p className="text-lg font-semibold">{report.studentData?.dropoutRate || 0}%</p>
              </div>
            </div>
            
            {report.studentData?.categoryWise && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Category-wise Distribution:</p>
                <div className="grid grid-cols-5 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">General</p>
                    <p className="font-semibold">{report.studentData.categoryWise.general}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">OBC</p>
                    <p className="font-semibold">{report.studentData.categoryWise.obc}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">SC</p>
                    <p className="font-semibold">{report.studentData.categoryWise.sc}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">ST</p>
                    <p className="font-semibold">{report.studentData.categoryWise.st}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <p className="text-gray-600">International</p>
                    <p className="font-semibold">{report.studentData.categoryWise.international}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Student Achievements</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hackathons</p>
                <p className="text-lg font-semibold">{report.achievements?.hackathons || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Research Papers</p>
                <p className="text-lg font-semibold">{report.achievements?.researchPapers || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Startups</p>
                <p className="text-lg font-semibold">{report.achievements?.startups || 0}</p>
              </div>
            </div>
          </div>

          {/* Academic Records */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Academic Records</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Average Attendance</p>
                <p className="text-lg font-semibold">{report.academicRecords?.averageAttendance || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pass Rate</p>
                <p className="text-lg font-semibold">{report.academicRecords?.passRate || 0}%</p>
              </div>
            </div>
          </div>

          {/* Placement Data */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Placement & Internships</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Placement %</p>
                <p className="text-lg font-semibold">{report.placementData?.placementPercentage || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Placed</p>
                <p className="text-lg font-semibold">{report.placementData?.totalPlaced || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Highest Package</p>
                <p className="text-lg font-semibold">₹{report.placementData?.highestPackage || 0} LPA</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Package</p>
                <p className="text-lg font-semibold">₹{report.placementData?.averagePackage || 0} LPA</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Internships</p>
                <p className="text-lg font-semibold">{report.placementData?.internships || 0}</p>
              </div>
            </div>
          </div>

          {/* Faculty Data */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Faculty Data</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Faculty</p>
                <p className="text-lg font-semibold">{report.facultyData?.totalFaculty || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">PhD Holders</p>
                <p className="text-lg font-semibold">{report.facultyData?.phdHolders || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">MTech Holders</p>
                <p className="text-lg font-semibold">{report.facultyData?.mtechHolders || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student-Teacher Ratio</p>
                <p className="text-lg font-semibold">{report.facultyData?.studentTeacherRatio || 0}:1</p>
              </div>
            </div>
          </div>

          {/* Comments */}
          {report.comments && report.comments.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Comments</h3>
              <div className="space-y-2">
                {report.comments.map((comment: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="text-sm font-semibold">{comment.role}</p>
                    <p className="text-sm">{comment.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default NAACReportView;
