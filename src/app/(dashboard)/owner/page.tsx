import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import FinanceChartContainer from "@/components/FinanceChartContainer";
import UserCard from "@/components/UserCard";

const OwnerPage = () => {
  return (
    <div className="p-4 flex gap-4 flex-col">
      <div className="flex gap-4 justify-between flex-wrap">
        <UserCard type="admin" />
        <UserCard type="teacher" />
        <UserCard type="student" />
        <UserCard type="parent" />
      </div>
      <div className="flex gap-4 flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 h-[450px]">
          <CountChartContainer />
        </div>
        <div className="w-full lg:w-2/3 h-[450px]">
          <AttendanceChartContainer />
        </div>
      </div>
      <div className="w-full h-[500px]">
        <FinanceChartContainer />
      </div>
    </div>
  );
};

export default OwnerPage;
