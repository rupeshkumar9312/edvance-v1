import { useState } from "react";
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Clock, Plus, Users, Settings } from "lucide-react";
import { useFees } from "@/hooks/useFees";
import AddFeeRecordDialog from "@/components/AddFeeRecordDialog";
import GenerateFeeRecordsDialog from "@/components/GenerateFeeRecordsDialog";
import PaymentDialog from "@/components/PaymentDialog";
import AddFeeTypeDialog from "@/components/AddFeeTypeDialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Fees = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [addFeeTypeDialogOpen, setAddFeeTypeDialogOpen] = useState(false);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<any>(null);
  
  const { feeRecords, loadingFeeRecords, feeTypes, loadingFeeTypes } = useFees();

  const filteredRecords = selectedStatus === "all" 
    ? feeRecords || []
    : (feeRecords || []).filter(record => record.status === selectedStatus);

  const totalAmount = (feeRecords || []).reduce((sum, record) => sum + record.amount, 0);
  const paidAmount = (feeRecords || []).filter(r => r.status === "paid").reduce((sum, record) => sum + record.amount, 0);
  const pendingAmount = (feeRecords || []).filter(r => r.status === "pending").reduce((sum, record) => sum + record.amount, 0);
  const overdueAmount = (feeRecords || []).filter(r => r.status === "overdue").reduce((sum, record) => sum + record.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePayment = (record: any) => {
    setSelectedFeeRecord(record);
    setPaymentDialogOpen(true);
  };

  if (loadingFeeRecords || loadingFeeTypes) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading fee records...</div>
        </div>
      </div>
    );
  }

  // Show message if no fee types exist
  if (!feeTypes || feeTypes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-gray-600">Track and manage student fee payments</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Fee Types Found</h3>
          <p className="text-gray-600 mb-4">
            You need to create fee types before you can manage fee records. 
            Fee types define the different kinds of fees (like tuition, library fees, etc.) that can be assigned to students.
          </p>
          <Button onClick={() => setAddFeeTypeDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Fee Type
          </Button>
        </div>

        <AddFeeTypeDialog 
          open={addFeeTypeDialogOpen} 
          onOpenChange={setAddFeeTypeDialogOpen} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600">Track and manage student fee payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddFeeTypeDialogOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Fee Types
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Fee
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Single Fee Record
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGenerateDialogOpen(true)}>
                <Users className="h-4 w-4 mr-2" />
                Generate for Multiple Students
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${(totalAmount / 100).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-gray-900">${(paidAmount / 100).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">${(pendingAmount / 100).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">${(overdueAmount / 100).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Fee Records */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Fee Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Student</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Class</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Fee Type</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Amount</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Due Date</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-6 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {record.students?.name || 'Unknown Student'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{record.students?.class || 'N/A'}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{record.fee_types?.name || 'Unknown Fee'}</td>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">
                    ${(record.amount / 100).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {new Date(record.due_date).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {record.status !== "paid" && (
                      <button 
                        onClick={() => handlePayment(record)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>Pay</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      <AddFeeRecordDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
      />
      
      <GenerateFeeRecordsDialog 
        open={generateDialogOpen} 
        onOpenChange={setGenerateDialogOpen} 
      />
      
      <AddFeeTypeDialog 
        open={addFeeTypeDialogOpen} 
        onOpenChange={setAddFeeTypeDialogOpen} 
      />
      
      {selectedFeeRecord && (
        <PaymentDialog 
          open={paymentDialogOpen} 
          onOpenChange={setPaymentDialogOpen}
          feeRecordId={selectedFeeRecord.id}
          studentName={selectedFeeRecord.students?.name || 'Unknown Student'}
          feeType={selectedFeeRecord.fee_types?.name || 'Unknown Fee'}
          amount={selectedFeeRecord.amount}
        />
      )}
    </div>
  );
};

export default Fees;
