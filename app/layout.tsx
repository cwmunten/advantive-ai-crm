import './globals.css';
export const metadata={
  title:'Chris CRM',
  description:'Persoonlijke CRM van Chris',
  icons:{
    icon:'https://raw.githubusercontent.com/cwmunten/advantive-ai-crm/main/Designer.png',
    shortcut:'https://raw.githubusercontent.com/cwmunten/advantive-ai-crm/main/Designer.png',
    apple:'https://raw.githubusercontent.com/cwmunten/advantive-ai-crm/main/Designer.png'
  }
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nl"><body>{children}</body></html>}