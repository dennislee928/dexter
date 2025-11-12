import ChatWindow from "@/components/chat/ChatWindow";
import ConversationHistory from "@/components/history/ConversationHistory";
import ModelSelector from "@/components/models/ModelSelector";
import UsageStats from "@/components/stats/UsageStats";
import SystemPromptEditor from "@/components/system/SystemPromptEditor";
import FileUpload from "@/components/files/FileUpload";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row">
      <section className="glass-panel flex w-full flex-col gap-6 p-6 lg:w-2/3">
        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-slate-800">Dexter · LocalAI 控制中心</h1>
          <p className="text-sm text-slate-500">
            管理 Dexter Agent 與 LocalAI 之間的對話、模型與檔案，確保金融研究流程安全可靠。
          </p>
        </header>
        <div className="flex flex-col gap-4">
          <ModelSelector />
          <SystemPromptEditor />
          <FileUpload />
        </div>
        <ChatWindow />
      </section>
      <aside className="flex w-full flex-col gap-6 lg:w-1/3">
        <UsageStats />
        <ConversationHistory />
      </aside>
    </main>
  );
}

