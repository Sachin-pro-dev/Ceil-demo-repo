import React, { useState } from 'react';

export interface SubmissionData {
  id: string;
  employeeName: string;
  department: string;
  taskTitle: string;
  hoursSpent: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

export const EmployeeSubmissionPortal: React.FC = () => {
  const [formData, setFormData] = useState<Omit<SubmissionData, 'id' | 'status' | 'submittedAt'>>({
    employeeName: '',
    department: 'Engineering',
    taskTitle: '',
    hoursSpent: 1,
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hoursSpent' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Mock API call latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!formData.employeeName.trim() || !formData.taskTitle.trim() || !formData.description.trim()) {
        throw new Error('Please fill in all mandatory fields.');
      }

      setMessage({
        type: 'success',
        text: 'Your work task submission has been successfully transmitted to the admin team!',
      });

      // Reset non-static fields
      setFormData((prev) => ({
        ...prev,
        taskTitle: '',
        hoursSpent: 1,
        description: '',
      }));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Employee Submission Portal</h2>
        <p className="text-sm text-gray-500 mt-1">Submit your daily tasks, hours worked, and progress reports for admin tracking.</p>
      </div>

      {message && (
        <div
          className={`p-4 mb-6 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Full Name *</label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleChange}
              required
              placeholder="e.g. John Doe"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            >
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Task Title *</label>
            <input
              type="text"
              name="taskTitle"
              value={formData.taskTitle}
              onChange={handleChange}
              required
              placeholder="e.g. Refactored authentication API"
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Hours Spent *</label>
            <input
              type="number"
              name="hoursSpent"
              value={formData.hoursSpent}
              onChange={handleChange}
              min="0.5"
              max="24"
              step="0.5"
              required
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Provide a brief summary of accomplishments, obstacles encountered, and next steps..."
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-md text-white font-medium text-sm transition-colors ${
              isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};
