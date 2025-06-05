
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Plus, FileText, Edit, Upload, File } from "lucide-react";
import { useBooks } from "@/hooks/useBooks";

export const BookTracker = () => {
  const { books, addBook, addPdf, updateBook, updateProgress } = useBooks();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPdfForm, setShowPdfForm] = useState(false);
  const [editingBook, setEditingBook] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    totalPages: '',
    currentPage: '0',
    notes: '',
    category: ''
  });
  const [pdfData, setPdfData] = useState({
    title: '',
    author: '',
    category: '',
    file: null as File | null
  });

  const handleAddBook = () => {
    if (!newBook.title || !newBook.author || !newBook.totalPages) return;
    
    addBook({
      title: newBook.title,
      author: newBook.author,
      totalPages: parseInt(newBook.totalPages),
      currentPage: parseInt(newBook.currentPage) || 0,
      notes: newBook.notes,
      category: newBook.category,
      type: 'book'
    });

    setNewBook({ title: '', author: '', totalPages: '', currentPage: '0', notes: '', category: '' });
    setShowAddForm(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfData(prev => ({ 
        ...prev, 
        file,
        title: prev.title || file.name.replace('.pdf', '')
      }));
    }
  };

  const handleAddPdf = async () => {
    if (!pdfData.file) return;
    
    try {
      await addPdf(
        pdfData.file,
        pdfData.title || undefined,
        pdfData.author || undefined,
        pdfData.category || undefined
      );
      
      setPdfData({ title: '', author: '', category: '', file: null });
      setShowPdfForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro ao fazer upload do PDF:', error);
    }
  };

  const updateNotes = (id: string, notes: string) => {
    updateBook(id, { notes });
    setEditingBook(null);
  };

  const getProgressPercentage = (book: any) => {
    return book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Desenvolvimento Pessoal': 'bg-blue-100 text-blue-700 border-blue-200',
      'Programação': 'bg-purple-100 text-purple-700 border-purple-200',
      'Ficção': 'bg-green-100 text-green-700 border-green-200',
      'Não-ficção': 'bg-orange-100 text-orange-700 border-orange-200',
      'PDF': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Add Book/PDF Form */}
      <Card className="bg-white/70 backdrop-blur-sm border-green-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-green-700">Biblioteca Pessoal</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setShowPdfForm(false);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Livro
              </Button>
              <Button 
                onClick={() => {
                  setShowPdfForm(!showPdfForm);
                  setShowAddForm(false);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t border-green-100 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Título do livro"
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                />
                <Input
                  placeholder="Autor"
                  value={newBook.author}
                  onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Total de páginas"
                  type="number"
                  value={newBook.totalPages}
                  onChange={(e) => setNewBook({...newBook, totalPages: e.target.value})}
                />
                <Input
                  placeholder="Página atual"
                  type="number"
                  value={newBook.currentPage}
                  onChange={(e) => setNewBook({...newBook, currentPage: e.target.value})}
                />
                <Input
                  placeholder="Categoria"
                  value={newBook.category}
                  onChange={(e) => setNewBook({...newBook, category: e.target.value})}
                />
              </div>
              <Textarea
                placeholder="Notas sobre o livro (opcional)"
                value={newBook.notes}
                onChange={(e) => setNewBook({...newBook, notes: e.target.value})}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddBook} className="bg-green-600 hover:bg-green-700">
                  Adicionar Livro
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {showPdfForm && (
          <CardContent className="border-t border-blue-100 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Selecionar arquivo PDF</label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
                {pdfData.file && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <File className="h-4 w-4" />
                    <span>{pdfData.file.name}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Título (opcional)"
                  value={pdfData.title}
                  onChange={(e) => setPdfData({...pdfData, title: e.target.value})}
                />
                <Input
                  placeholder="Autor (opcional)"
                  value={pdfData.author}
                  onChange={(e) => setPdfData({...pdfData, author: e.target.value})}
                />
                <Input
                  placeholder="Categoria (opcional)"
                  value={pdfData.category}
                  onChange={(e) => setPdfData({...pdfData, category: e.target.value})}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddPdf} 
                  disabled={!pdfData.file}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Adicionar PDF
                </Button>
                <Button variant="outline" onClick={() => setShowPdfForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Card key={book.id} className="bg-white/70 backdrop-blur-sm border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {book.type === 'pdf' ? (
                      <File className="h-5 w-5 text-red-600" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    )}
                    {book.type === 'pdf' && book.pdfUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(book.pdfUrl, '_blank')}
                        className="h-6 px-2 text-xs"
                      >
                        Abrir PDF
                      </Button>
                    )}
                  </div>
                  {book.category && (
                    <Badge variant="outline" className={getCategoryColor(book.category)}>
                      {book.category}
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 leading-tight">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.author}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress */}
              {book.type === 'book' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-medium">{book.currentPage}/{book.totalPages} páginas</span>
                  </div>
                  <Progress value={getProgressPercentage(book)} className="h-2" />
                  <div className="text-center">
                    <Badge className="bg-blue-100 text-blue-700">
                      {Math.round(getProgressPercentage(book))}% concluído
                    </Badge>
                  </div>
                </div>
              )}

              {/* Update Progress */}
              {book.type === 'book' && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Página atual"
                    max={book.totalPages}
                    onChange={(e) => {
                      const newPage = parseInt(e.target.value) || 0;
                      updateProgress(book.id, newPage);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingBook(book.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {book.type === 'pdf' && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingBook(book.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Notas</span>
                </div>
                
                {editingBook === book.id ? (
                  <div className="space-y-2">
                    <Textarea
                      defaultValue={book.notes}
                      placeholder="Adicione suas notas sobre o livro..."
                      rows={3}
                      className="text-sm"
                      onBlur={(e) => updateNotes(book.id, e.target.value)}
                    />
                    <Button 
                      size="sm" 
                      onClick={() => setEditingBook(null)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Salvar
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                    {book.notes || 'Clique no ícone de edição para adicionar notas...'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
