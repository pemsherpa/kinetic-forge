import { TopNav } from "@/components/dashboard/TopNav";
import { LeftSidebar } from "@/components/dashboard/LeftSidebar";
import { PipelineView } from "@/components/dashboard/PipelineView";
import { TelemetryPanel } from "@/components/dashboard/TelemetryPanel";

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-background hex-grid">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <PipelineView />
        <TelemetryPanel />
      </div>
    </div>
  );
};

export default Index;
