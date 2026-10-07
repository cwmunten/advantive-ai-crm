import './globals.css';
export const metadata={
  title:'Chris CRM',
  description:'Persoonlijke CRM van Chris',
  icons:{
    icon:'/Designer.png',
    shortcut:'/Designer.png',
    apple:'/Designer.png'
  }
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="nl"><body>{children}</body></html>}