import EditorBreadcrumb from '../editor/EditorBreadcrumb';
import EditorTabs from '../editor/EditorTabs';
import MonacoEditor from '../editor/MonacoEditor';

export default function EditorArea() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <EditorTabs />
      <EditorBreadcrumb />
      <MonacoEditor />
    </div>
  );
}
