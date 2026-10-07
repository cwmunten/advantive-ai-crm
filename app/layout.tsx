import './globals.css';
export const metadata={
  title:'Chris CRM',
  description:'Persoonlijke CRM van Chris',
  applicationName:'Chris CRM',
  appleWebApp:{capable:true,statusBarStyle:'default',title:'Chris CRM'},
  formatDetection:{telephone:false},
  icons:{
    icon:'https://raw.githubusercontent.com/cwmunten/advantive-ai-crm/main/Designer.png',
    shortcut:'https://raw.githubusercontent.com/cwmunten/advantive-ai-crm/main/Designer.png',
    apple:'https://raw.githubusercontent.com/cwmunten/advantive-ai-crm/main/Designer.png'
  }
};
export const viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#f5f7fb'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nl"><body>{children}</body></html>}
