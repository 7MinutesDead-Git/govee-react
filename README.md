# Govee React
A React+Node app originally to let my partner control my wifi LED lights remotely from anywhere, on any device (with a browser). 
  
  This project was recently converted from Create React App to **Vite** for better performance and development experience.


  
This should work with every Govee light that supports their external API, though I haven't tested it on bulbs beyond H6003. 
  
![govee](https://user-images.githubusercontent.com/50963144/211161697-0ef372f6-3f5e-4c16-be1f-d4e7e0525028.jpg)

  
Adjust the sliders and color pickers to change the brightness and color of the lightbulbs via REST API.  
  
You can save currently selected favorite colors as preset color swatches in the "Presets" accordion menu for each connected light. These presets are saved in localStorage.  
  
Requests are sent to the [node server](https://github.com/7MinutesDead-Git/govee-server), before forwarded onto [Govee's external API](https://govee-public.s3.amazonaws.com/developer-docs/GoveeDeveloperAPIReference.pdf) (since these particular bulbs do not have local API support).  
  
React-query is used to manage cache and refetch stale data automatically. However, Govee's official external API is aggressively rate-limited which severely limits how often we can automatically refetch data to keep the UI in sync (say, if we make changes via Govee's official app rather than this one).  
  
But wouldn't it be cool if not only we could get the current state more often, but even see external changes live? Of course it would! So, this app also makes use of websockets.  
Any interaction with the UI by you or others will update live for all clients. The server simply broadcasts all changes received to all clients. This is a separate route from the commands sent to the external Govee API for actually changing the lights, and is handled by the node server.  
  
The client also [interpolates](https://en.wikipedia.org/wiki/Linear_interpolation) between websocket messages received from the server, so things look smoother. Meaning, if your client receives color updates (someone else is moving the color picker around) every 100ms, the UI will still update every say 16.7ms (60 FPS) and choose a value at a point between the received update and the currently *lerped* (linearly interpolated) value, thus inching closer each render in a smooth fashion.  
This allows us to reasonably cutdown on the amount of network activity and server load while keeping the live aspect of the UI responsive and smooth.  
  
This is like how video games smooth out player movement with network or server latency. If you're into game development, you've likely seen `lerp` a lot, haha.
  
## SETUP  
1) Once you have cloned down or forked this repo, be sure to run `npm install` in the root directory to install the dependencies *(such as the very nice [react-hot-toast](https://react-hot-toast.com/) for fancy toast notifications when commands are being sent to the server).* 
2) On your local dev build, you'll need to place a `.env` file in the root directory, configured as such:  
```
VITE_PORT="8080"
VITE_SERVER_URL="http://localhost"
VITE_SERVER_SOCKET="ws://localhost"
```
3) You'll want to modify these environment variables on whatever service you decide to host the app on, to match where you end up hosting the backend server *(for example, replace `http://localhost` with `whatever-you-name-your-backend.fly.io` if your server was hosted on fly.io)*.  
    Most services have their own ways of setting environment variables, so check with their documentation (netlify for example has an "Environment" setting under "Build and Deploy" where you can declare these for production).  
  
4) Setup the [govee-server backend here](https://github.com/7MinutesDead-Git/govee-server), and choose a hosting service or method for deployment of a backend.  
  
5) Deploy and have fun!
