# Ball Don't Lie

### Basic Info:

This is the final group project for CS 174A titled Balls Don't Lie.

This is a minigame that simulates baseball. The player aims to reach the target score by swinging
at the baseballs thrown, but not at the basketballs thrown.

### Setup

After downloading and unzipping the file, execute the "host.bat".

After executing, go to google chrome or other compatible browsers and go to localhost:####
Where #### is the number shown in the host.bat terminal window in the line "serving at port ####"

### Additional Info:

Player controls:
'a' move left
'd' move right
'SPACE' swing
'r' restart
'm' start

Additional controls:
'1' Easy mode
'2' Hard mode
'n' toggle night/day

Gameplay:
Balls are pitched at random velocities and directions. Players are to swing the bat by pressing space to try to 
hit the baseballs thrown at them. There are also basketballs randomly mixed into the balls pitched. If basketballs
are hit by the bat, the player loses the game. Players are trying to reach at least 3 hits in the 20 pitched.
On hard mode, the player only gets score increases with home runs.

### Advanced Features used

Collision detection to detect ball contact with bat and floor.

Physics to determine baseball trajectory once hit.