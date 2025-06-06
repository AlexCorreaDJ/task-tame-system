
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 Iniciando aplicação TDAHFOCUS...');
console.log('🔧 Verificando elementos DOM...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('❌ Elemento root não encontrado!');
} else {
  console.log('✅ Elemento root encontrado');
}

try {
  console.log('📱 Criando root React...');
  const root = createRoot(rootElement!);
  
  console.log('🎯 Renderizando App component...');
  root.render(<App />);
  
  console.log('✅ App renderizado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao renderizar App:', error);
}
