// // src/pages/ManagerDashboard.js
// import React, { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPendingLeaves, approveLeave, rejectLeave } from "../redux/leaveSlice.js";
// import { Button } from "../components/ui/button.js";

// const ManagerDashboard = () => {
//   const dispatch = useDispatch();
//   const { pendingLeaves, status, error } = useSelector((state) => state.leave);

//   useEffect(() => {
//     dispatch(fetchPendingLeaves());
//   }, [dispatch]);

//   const handleApprove = (leaveId) => {
//     dispatch(approveLeave(leaveId));
//   };

//   const handleReject = (leaveId) => {
//     dispatch(rejectLeave(leaveId));
//   };

//   return (
//     <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
//       <h2 className="text-3xl font-bold mb-6 text-center">Pending Leave Requests</h2>

//       {status === "loading" && <p>Loading leave requests...</p>}
//       {error && <p className="text-red-600 text-center">{error}</p>}
//       {Array.isArray(pendingLeaves) && pendingLeaves.length === 0 && status === "succeeded" && (
//         <p className="text-gray-500 text-center">No pending leave requests.</p>
//       )}

//       <div className="space-y-6">
//         {Array.isArray(pendingLeaves) && pendingLeaves.map((leave) => (
//           <div
//             key={leave._id}
//             className="flex justify-between items-center p-5 bg-gray-100 rounded-lg shadow-sm"
//           >
//             <div className="space-y-1">
//               <p><strong>Employee:</strong> {leave.user?.name || "Unknown"}</p>
//               <p><strong>Leave Type:</strong> {leave.leaveType}</p>
//               <p><strong>Start Date:</strong> {new Date(leave.startDate).toLocaleDateString()}</p>
//               <p><strong>End Date:</strong> {new Date(leave.endDate).toLocaleDateString()}</p>
//               <p><strong>Total Days:</strong> {leave.totalDays}</p>
//               <p><strong>Status:</strong> {leave.status}</p>
//             </div>

//             <div className="flex flex-col gap-3">
//               <Button
//                 className="bg-green-600 hover:bg-green-700 text-white"
//                 onClick={() => handleApprove(leave._id)}
//               >
//                 Approve
//               </Button>
//               <Button
//                 className="bg-red-600 hover:bg-red-700 text-white"
//                 onClick={() => handleReject(leave._id)}
//               >
//                 Reject
//               </Button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ManagerDashboard;
