
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { NotebookPen } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export const ProjectNotesBlock = () => {
  const [notes, setNotes] = useLocalStorage('focusflow-project-notes', '');

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-purple-700 flex items-center gap-2">
          <NotebookPen className="h-5 w-5" />
          Bloco de Notas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Escreva suas anotações rápidas aqui... ideias, lembretes, insights..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <div className="mt-2 text-xs text-gray-500">
          Suas anotações são salvas automaticamente
        </div>
      </CardContent>
    </Card>
  );
};
