function Home() {
  return (
    <div className="home container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-4 text-center">Welcome to 5199's Scouting App!</h1>
          
          <div className="text-center">
            <p><u>Important!!!</u></p>
            <p>The website is functional even if the user goes offline while filling out the form. However, once the form is submitted, be sure to reconnect to Wi-Fi so that data can be sent to the google sheet for compilation. Additionally, avoid reloading the page, navigating to a different page, or closing the website while filling out the form as it will NOT automatically save forms in progress.</p>
            
            <br />
            <br />
            <br />
            <br />
            <br />
            
            <p>This website is used for scouting to determine the best robots and teams to choose during Alliance Selection. Currently we only have stand scouting available on the app, but pit scouting will be added in the future.</p>
            
            <br />
            <br />
            
            <p>Stand scouting is the main type of scouting done in FRC. Stand scouting is done by scouters in the stands collecting data on the performance of robots during matches. The stand scouting form can be found in the menu bar.</p>
            
            <br />
            <br />
            
            <p>Pit scouting done by scouters in the pits collecting robot data, such as dimensions and weight of the robot. Pit scouters also upload an image of the robot. Pit scouting has not yet been created on this website.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;