import './card.css';

const statsData = [
  {
    value: "120K+",
    title: "Smart Resumes Generated",
    subtitle: "using AI-powered customization",
  },
  {
    value: "98%",
    title: "Interview Call Rate Boost",
    subtitle: "after using ResumeX templates",
  },
  {
    value: "4.9★",
    title: "User Satisfaction Score",
    subtitle: "from 32,000+ professional users",
  },
];

function StatsBox(props){
  return(
    <div className='cardbox'>
      <p className='d-title'>{props.value}</p>
      <p>{props.title}</p>
      <p>{props.subtitle}</p>
    </div>
  )
}

function StatsItem(){
  return(
  <div className="stats-wrapper">
    {
      statsData.map((item ,index)=>(
          <StatsBox 
          key={index}
          value={item.value}
          title={item.title}
          subtitle={item.subtitle} />
      ))
    }
  </div>)
  }
export default StatsItem;
