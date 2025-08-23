import './App.css'
import CompanyLogos from './CompanyLogos.jsx'
import Header from './Header.jsx'
import HeroText from './HeroText.jsx'
import DesignShowcase from './DesignShowcase.jsx'
import StatsItem from './card.jsx';
import Light from './light.jsx'
import Description from './Description.jsx'
import ResumeUpload from './ResumeUpload.jsx'
import Footer from './Footer.jsx'
import ReportsTable from './ReportsTable.jsx'

function Home(){
  return(
  <>
    <Header />
    <div className="blob"></div>
      <div className="blob"></div>
      <div className="section-1">
        <div><HeroText /></div>
        <div className='design'><DesignShowcase  /></div>
      </div>
       
        
         
       
        
      
      
      
      
        <CompanyLogos />
      
        <StatsItem />
        <Light />
        <Description />
        
        <ResumeUpload />
        
        <div className="blob"></div>
        <Footer />
      
    </>
  
  )
  
}
export default Home;