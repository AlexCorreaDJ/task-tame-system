
import { useLocalStorage } from './useLocalStorage';

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  notes: string;
  category: string;
  createdAt: string;
  type: 'book';
}

export const useBooks = () => {
  const [books, setBooks] = useLocalStorage<Book[]>('focusflow-books', [
    {
      id: '1',
      title: 'Atomic Habits',
      author: 'James Clear',
      totalPages: 320,
      currentPage: 156,
      notes: 'Excelente livro sobre formação de hábitos. O conceito de 1% melhor a cada dia é muito poderoso.',
      category: 'Desenvolvimento Pessoal',
      createdAt: new Date().toISOString(),
      type: 'book'
    },
    {
      id: '2',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      totalPages: 464,
      currentPage: 89,
      notes: 'Princípios fundamentais para escrever código limpo e mantível.',
      category: 'Programação',
      createdAt: new Date().toISOString(),
      type: 'book'
    }
  ]);

  const addBook = (bookData: Omit<Book, 'id' | 'createdAt'>) => {
    const newBook: Book = {
      ...bookData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setBooks(prev => [...prev, newBook]);
    return newBook;
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(prev => prev.map(book => 
      book.id === id ? { ...book, ...updates } : book
    ));
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(book => book.id !== id));
  };

  const updateProgress = (id: string, newPage: number) => {
    const book = books.find(b => b.id === id);
    if (book) {
      updateBook(id, { currentPage: Math.min(newPage, book.totalPages) });
    }
  };

  return {
    books,
    addBook,
    updateBook,
    deleteBook,
    updateProgress
  };
};
