import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

export class Text_Line extends Shape {                           // **Text_Line** embeds text in the 3D world, using a crude texture
    // method.  This Shape is made of a horizontal arrangement of quads.
    // Each is textured over with images of ASCII characters, spelling
    // out a string.  Usage:  Instantiate the Shape with the desired
    // character line width.  Then assign it a single-line string by calling
    // set_string("your string") on it. Draw the shape on a material
    // with full ambient weight, and text.png assigned as its texture
    // file.  For multi-line strings, repeat this process and draw with
    // a different matrix.
    constructor(max_size) {
        super("position", "normal", "texture_coord");
        this.max_size = max_size;
        var object_transform = Mat4.identity();
        for (var i = 0; i < max_size; i++) {                                       // Each quad is a separate Square instance:
            defs.Square.insert_transformed_copy_into(this, [], object_transform);
            object_transform.post_multiply(Mat4.translation(1.5, 0, 0));
        }
    }

    set_string(line, context) {           // set_string():  Call this to overwrite the texture coordinates buffer with new
        // values per quad, which enclose each of the string's characters.
        this.arrays.texture_coord = [];
        for (var i = 0; i < this.max_size; i++) {
            var row = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) / 16),
                col = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) % 16);

            var skip = 3, size = 32, sizefloor = size - skip;
            var dim = size * 16,
                left = (col * size + skip) / dim, top = (row * size + skip) / dim,
                right = (col * size + sizefloor) / dim, bottom = (row * size + sizefloor + 5) / dim;

            this.arrays.texture_coord.push(...Vector.cast([left, 1 - bottom], [right, 1 - bottom],
                [left, 1 - top], [right, 1 - top]));
        }
        if (!this.existing) {
            this.copy_onto_graphics_card(context);
            this.existing = true;
        } else
            this.copy_onto_graphics_card(context, ["texture_coord"], false);
    }
}


export class Assignment3 extends Scene {
    constructor() {
        
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        this.hoop_location = Mat4.identity();
        this.hoop_number = 5;

        this.score = 0;

        this.ball_1_location = 4;

        this.ball_2_location = 5;

        this.high_score = 0;

        this.ball_speed = 300;

        //this.initial_camera_location = 

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            torus: new defs.Torus(15, 15),
            torus2: new defs.Torus(3, 15),
            sphere: new defs.Subdivision_Sphere(4),
            circle: new defs.Regular_2D_Polygon(1, 15),
            cube: new defs.Cube(),
            text: new Text_Line(40),
            square: new defs.Square(),
            
            // TODO:  Fill in as many additional shape instances as needed in this key/value table.
            //        (Requirement 1)
        };

        const texture = new defs.Textured_Phong(1);

        this.text_image = new Material(texture, {
            ambient: 1, diffusivity: 0, specularity: 0,
            texture: new Texture("assets/text.png")
        });

        // *** Materials
        this.materials = {
            test: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            test2: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#992828")}),
            ring: new Material(new Ring_Shader()),
            // TODO:  Fill in as many additional material objects as needed in this key/value table.
            //        (Requirement 4)
        }

        //this.initial_camera_location = Mat4.look_at(vec3(0, 20, 100), vec3(0, 0, 0), vec3(0, 1, 0));
        //this.initial_camera_location = Mat4.rotation(Math.PI/2, 0, 1, 0).times(Mat4.look_at(vec3(0, 20, 10), vec3(0, 5, 0), vec3(0, 1, 0)));
        //this.initial_camera_location = Mat4.look_at(vec3(0, 20, 10), vec3(0, 5, 0), vec3(0, 1, 0));
        
        this.camera_view = Mat4.look_at(vec3(0, 20, 20), vec3(0, 0, 0), vec3(0, 1, 0));

        this.current_view_number = 1;

        //this.attached = this.camera_view;
        //this.view_2 = Mat4.look_at(vec3(0, 20, 10), vec3(0, 5, 0), vec3(0, 1, 0));
        //this.view_3 = Mat4.identity().times(Mat4.translation(0, 0, -30)).times(Mat4.rotation(Math.PI, 0, 1, 0));

    }



    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change to view 1", ["1"], () => (this.attached = changeView(1, this.current_view_number), this.current_view_number = 1));
        this.key_triggered_button("Change to view 2", ["2"], () => (this.attached = changeView(2, this.current_view_number), this.current_view_number = 2));
        this.new_line();
        this.key_triggered_button("Change to view 3", ["3"], () => (this.attached = changeView(3, this.current_view_number), this.current_view_number = 3));
        this.key_triggered_button("Change to view 4", ["4"], () => (this.attached = changeView(4, this.current_view_number), this.current_view_number = 4));
        
        this.new_line();

        this.key_triggered_button("Move forward", ["w"], () => this.hoop_number = moveToSquare(this.hoop_number, 'u', this.current_view_number));
        this.key_triggered_button("Move left", ["a"], () => this.hoop_number = moveToSquare(this.hoop_number, 'l', this.current_view_number));
        this.new_line();
        this.key_triggered_button("Move down", ["s"], () => this.hoop_number = moveToSquare(this.hoop_number, 'd', this.current_view_number));
        this.key_triggered_button("Move right", ["d"], () => this.hoop_number = moveToSquare(this.hoop_number, 'r', this.current_view_number));
    
        this.new_line();
        this.key_triggered_button("turn on", ["e"], () => this.endgame);
        this.key_triggered_button("turn off", ["q"], () => this.startgame);

        this.new_line();
        this.key_triggered_button("add score", ["c"], () => (this.addScore()));
        this.key_triggered_button("reset score", ["5"], () => (this.resetScore()));
    }

    addScore()
    {
        if (this.ball_speed > 100)
        {
            this.ball_speed = this.ball_speed - 10;
        }
        //this.ball_speed--;
        this.score++;
        if (this.score > this.high_score)
        {
            this.high_score = this.score;
        }
    }

    resetScore()
    {
        this.ball_speed = 300;
        this.score = 0;
    }

    // newLocation(ballNum)
    // {
    //     if (ballNum == 1)
    //     {
    //         this.ball_1_location = 
    //     }
    // }


    endgame()
    {
        var overlay = document.getElementById('overlay');
        overlay.style.display = "block";
    }

    startgame()
    {
        var overlay = document.getElementById('overlay');
        overlay.style.display = "none";
    }

    display(context, program_state) {
        

        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.camera_view);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);

        // TODO: Create Planets (Requirement 1)
        // this.shapes.[XXX].draw([XXX]) // <--example

        // TODO: Lighting (Requirement 2)
        const light_position = vec4(0, 5, 5, 1);
        // The parameters of the Light are: position, color, size
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 3 and 4)
        const t = program_state.animation_time / this.ball_speed, dt = program_state.animation_delta_time / this.ball_speed;
        const yellow = hex_color("#fac91a");

        

        let model_transform = Mat4.identity();

        

        let model_transform_base1 = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(-2, -2, 0.5));
        let model_transform_base2 = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(0, -2, 0.5));
        let model_transform_base3 = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(2, -2, 0.5));
        let model_transform_base4 = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(-2, 0, 0.5));
        let model_transform_base5 = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(0, 0, 0.5));
        let model_transform_base6 = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(2, 0, 0.5));
        let model_transform_base7 = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(-2, 2, 0.5));
        let model_transform_base8 = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(0, 2, 0.5));
        let model_transform_base9 = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(2, 2, 0.5));

        
        let model_transform_scoreboard = model_transform.times(Mat4.rotation(Math.PI/2, 1, 0, 0)).times(Mat4.translation(0, 5, 0.5)
                                            .times(Mat4.scale(2, 1, 0.1)));

                                            
        let model_transform_ball = Mat4.identity();                                    
        if (t % 10 <= 0.03)
        {
            //this.addScore();
            if (this.hoop_number == this.ball_1_location)
            {
                this.addScore();
            }
            else
            {
                this.resetScore();
            }
            this.ball_1_location = Math.floor(Math.random() * (9) + 1);
            if (this.ball_1_location == 1)
            {
                model_transform_ball = model_transform_base1.times(Mat4.translation(0, 0, -11));
            }
            else if (this.ball_1_location == 2)
            {
                model_transform_ball = model_transform_base2.times(Mat4.translation(0, 0, -11));
            }
            else if (this.ball_1_location == 3)
            {
                model_transform_ball = model_transform_base3.times(Mat4.translation(0, 0, -11));
            }
            else if (this.ball_1_location == 4)
            {
                model_transform_ball = model_transform_base4.times(Mat4.translation(0, 0, -11));
            }
            else if (this.ball_1_location == 5)
            {
                model_transform_ball = model_transform_base5.times(Mat4.translation(0, 0, -11));
            }
            else if (this.ball_1_location == 6)
            {
                model_transform_ball = model_transform_base6.times(Mat4.translation(0, 0, -11));
            }
            else if (this.ball_1_location == 7)
            {
                model_transform_ball = model_transform_base7.times(Mat4.translation(0, 0, -11));
            }
            else if (this.ball_1_location == 8)
            {
                model_transform_ball = model_transform_base8.times(Mat4.translation(0, 0, -11));
            }
            else{
                model_transform_ball = model_transform_base9.times(Mat4.translation(0, 0, -11));
            }
        }
        else
        {
            if (this.ball_1_location == 1)
            {
                model_transform_ball = model_transform_base1.times(Mat4.translation(0, 0, -(11 - t % 10)));
            }
            else if (this.ball_1_location == 2)
            {
                 model_transform_ball = model_transform_base2.times(Mat4.translation(0, 0, -(11 - t % 10)));
            }
            else if (this.ball_1_location == 3)
            {
                 model_transform_ball = model_transform_base3.times(Mat4.translation(0, 0, -(11 - t % 10)));
            }
            else if (this.ball_1_location == 4)
            {
                 model_transform_ball = model_transform_base4.times(Mat4.translation(0, 0, -(11 - t % 10)));
            }
            else if (this.ball_1_location == 5)
            {
                 model_transform_ball = model_transform_base5.times(Mat4.translation(0, 0, -(11 - t % 10)));
            }
            else if (this.ball_1_location == 6)
            {
                 model_transform_ball = model_transform_base6.times(Mat4.translation(0, 0, -(11 - t % 10)));
            }
            else if (this.ball_1_location == 7)
            {
                 model_transform_ball = model_transform_base7.times(Mat4.translation(0, 0, -(11 - t % 10)));
            }
            else if (this.ball_1_location == 8)
            {
                 model_transform_ball = model_transform_base8.times(Mat4.translation(0, 0, -(11 - t % 10)));
            }
            else
            {
                 model_transform_ball = model_transform_base9.times(Mat4.translation(0, 0, -(11 - t % 10)));
            }


        }
        



        let desired = model_transform;
        if (this.hoop_number == 1)
        {
            desired = model_transform_base1.times(Mat4.translation(0, 0, -0.5));
            //desired = desired.map((x,i) => Vector.from(this.hoop_location).mix(x, 0.5));
        }
        else if (this.hoop_number == 2)
        {
            desired = model_transform_base2.times(Mat4.translation(0, 0, -0.5));
            //desired = desired.map((x,i) => Vector.from(this.hoop_location).mix(x, 0.5));
        }
        else if (this.hoop_number == 3)
        {
            desired = model_transform_base3.times(Mat4.translation(0, 0, -0.5));
            //desired = desired.map((x,i) => Vector.from(this.hoop_location).mix(x, 0.5));
        }
        else if (this.hoop_number == 4)
        {
            desired = model_transform_base4.times(Mat4.translation(0, 0, -0.5));
            //desired = desired.map((x,i) => Vector.from(this.hoop_location).mix(x, 0.5));
        }
        else if (this.hoop_number == 5)
        {
            desired = model_transform_base5.times(Mat4.translation(0, 0, -0.5));
            //desired = desired.map((x,i) => Vector.from(this.hoop_location).mix(x, 0.5));
        }
        else if (this.hoop_number == 6)
        {
            desired = model_transform_base6.times(Mat4.translation(0, 0, -0.5));
            //desired = desired.map((x,i) => Vector.from(this.hoop_location).mix(x, 0.5));
        }
        else if (this.hoop_number == 7)
        {
            desired = model_transform_base7.times(Mat4.translation(0, 0, -0.5));
            //desired = desired.map((x,i) => Vector.from(this.hoop_location).mix(x, 0.5));
        }
        else if (this.hoop_number == 8)
        {
            desired = model_transform_base8.times(Mat4.translation(0, 0, -0.5));
            //desired = desired.map((x,i) => Vector.from(this.hoop_location).mix(x, 0.5));
        }
        else
        {
            desired = model_transform_base9.times(Mat4.translation(0, 0, -0.5));
            //desired = desired.map((x,i) => Vector.from(this.hoop_location).mix(x, 0.5));
        }


        let model_transform_hoop = desired;



        this.shapes.torus.draw(context, program_state, model_transform_hoop, this.materials.test.override({color: yellow}));

        
        
        //Drawing the bases where the torus sits upon

        const white = hex_color("#ffffff");
        const red = hex_color("#FF3B47");
        const orange = hex_color("#FF8027");
        const yellow2 = hex_color("#FFCA2C");
        const green = hex_color("#49C768");
        const light_blue = hex_color("#90E0FB")
        const blue = hex_color("#4D76F2");
        const purple = hex_color("#9247D8");
        const light_purple = hex_color("#C5A0E6");
        const dark_blue = hex_color("#00008b");

        
        

        
        this.shapes.square.draw(context, program_state, model_transform_base1, this.materials.test.override({color: red}));
        this.shapes.square.draw(context, program_state, model_transform_base2, this.materials.test.override({color: orange}));
        this.shapes.square.draw(context, program_state, model_transform_base3, this.materials.test.override({color: yellow2}));
        this.shapes.square.draw(context, program_state, model_transform_base4, this.materials.test.override({color: green}));
        this.shapes.square.draw(context, program_state, model_transform_base5, this.materials.test.override({color: white}));
        this.shapes.square.draw(context, program_state, model_transform_base6, this.materials.test.override({color: light_blue}));
        this.shapes.square.draw(context, program_state, model_transform_base7, this.materials.test.override({color: blue}));
        this.shapes.square.draw(context, program_state, model_transform_base8, this.materials.test.override({color: purple}));
        this.shapes.square.draw(context, program_state, model_transform_base9, this.materials.test.override({color: light_purple}));
        
        this.shapes.cube.draw(context, program_state, model_transform_scoreboard, this.materials.test.override({color: dark_blue}));
        //this.shapes.cube.draw(context, program_state, model_transform_scoreboard, this.materials.test.override({color: dark_blue}));
        
        this.shapes.sphere.draw(context, program_state, model_transform_ball, this.materials.test.override({color: dark_blue}));

        // const funny_orbit = Mat4.rotation(Math.PI / 4 * t, Math.cos(t), Math.sin(t), .7 * Math.cos(t));
        // this.shapes.cube.draw(context, program_state, funny_orbit, this.materials.test.override({color: light_purple}));


        let strings = ["Score: " + this.score.toString(), "High Score: " + this.high_score.toString()];
        //let strings = ["Score: ab", "High Score: cd"];

        // // Sample the "strings" array and draw them onto a cube.
        // for (let i = 0; i < 3; i++)
        //     for (let j = 0; j < 2; j++) {             // Find the matrix for a basis located along one of the cube's sides:
        //         let cube_side = Mat4.rotation(i == 0 ? Math.PI / 2 : 0, 1, 0, 0)
        //             .times(Mat4.rotation(Math.PI * j - (i == 1 ? Math.PI / 2 : 0), 0, 1, 0))
        //             .times(Mat4.translation(-.9, .9, 1.01));

        //         const multi_line_string = strings[2 * i + j].split('\n');
        //         // Draw a Text_String for every line in our string, up to 30 lines:
        //         //for (let line of multi_line_string.slice(0, 30)) {             // Assign the string to Text_String, and then draw it.
        //             this.shapes.text.set_string(this.score.toString(), context.context);
        //             this.shapes.text.draw(context, program_state, funny_orbit.times(cube_side)
        //                 .times(Mat4.scale(3, 3, 3)), this.text_image);
        //             // Move our basis down a line.
        //             cube_side.post_multiply(Mat4.translation(0, -.06, 0));
        //         //}
        //     }

        let scoreboard_front = model_transform_scoreboard.times(Mat4.translation(-0.8, -0.2, -1.1)).times(Mat4.rotation(Math.PI, 1, 0, 0));
    
        for (let i = 0; i < 2; i++) {             // Assign the string to Text_String, and then draw it.
            this.shapes.text.set_string(strings[i], context.context);
            this.shapes.text.draw(context, program_state, scoreboard_front
                .times(Mat4.scale(0.08, 0.20, 0.3)), this.text_image);
            // Move our basis down a line.
            scoreboard_front.post_multiply(Mat4.translation(0, -.6, 0));
        }

        // this.shapes.text.set_string(line, context.context);
        //             this.shapes.text.draw(context, program_state, model_transform_scoreboard.times(Mat4.translation(-0.7, 0, -1.1))
        //                 //.times(Mat4.rotation(Math.PI, 0, 0, 0))
        //                 .times(Mat4.rotation(Math.PI, 1, 0, 0))
        //                 .times(Mat4.scale(0.12, 0.3, 0.3)), this.text_image);

        // this.shapes.text.set_string(("High Score: " + this.high_score.toString()), context.context);
        // this.shapes.text.draw(context, program_state, model_transform_scoreboard.times(Mat4.translation(-0.7, 0, -1.1))
        //     //.times(Mat4.rotation(Math.PI, 0, 0, 0))
        //     .times(Mat4.rotation(Math.PI, 1, 0, 0))
        //     .times(Mat4.scale(0.12, 0.3, 0.3)), this.text_image);
        
        if (this.attached)
        {
            //let desired = this.attached;
            //desired = desired.map((x, i) => Vector.from(program_state.camera_transform[i]).mix(x, 0.9));
            //program_state.set_camera(desired);
            program_state.set_camera(this.attached);
        }
        
    }
}


function changeView(view_direction, current_view)
{
    if (view_direction == 1)
    {
        current_view = 1;
        return  Mat4.look_at(vec3(0, 20, 20), vec3(0, 0, 0), vec3(0, 1, 0));
        
    }
    else if (view_direction == 2)
    {
        current_view = 2;
        return Mat4.look_at(vec3(20, 20, 0), vec3(0, 0, 0), vec3(0, 1, 0));
        
    }
    else if (view_direction == 3)
    {
        current_view = 3;
        return Mat4.look_at(vec3(0, 20, -20), vec3(0, 0, 0), vec3(0, 1, 0));
        
    }
    else if (view_direction == 4)
    {
        current_view = 4;
        return Mat4.look_at(vec3(-20, 20, 0), vec3(0, 0, 0), vec3(0, 1, 0));
        
    }
}



//Returns the square number that was moved to
//hoop_number is the initial location
//direction is the user's key direction u = up, r = right, d = down, l = left
//cv is the current view angle (from views 1-4)
function moveToSquare(hoop_number, direction, cv){
    if (hoop_number == 1)
    {
        if ((direction == 'r' && cv == 1) || (direction == 'd' && cv == 2) ||
            (direction == 'l' && cv == 3) || (direction == 'u' && cv == 4))
        {
            return 2;
        }else if ((direction == 'd' && cv == 1) || (direction == 'l' && cv == 2) ||
        (direction == 'u' && cv == 3) || (direction == 'r' && cv == 4))
        {
            return 4;
        }
        
        return 1;
        
    }
    else if (hoop_number == 2)
    {
        if ((direction == 'r' && cv == 1) || (direction == 'd' && cv == 2) ||
        (direction == 'l' && cv == 3) || (direction == 'u' && cv == 4)){
            return 3;
        }
        else if ((direction == 'd' && cv == 1) || (direction == 'l' && cv == 2) ||
        (direction == 'u' && cv == 3) || (direction == 'r' && cv == 4))
        {
            return 5;
        }
        else if ((direction == 'l' && cv == 1) || (direction == 'u' && cv == 2) ||
        (direction == 'r' && cv == 3) || (direction == 'd' && cv == 4))
        {
            return 1;
        }
        
        return 2;
    }   
    else if (hoop_number == 3)
    {
        if ((direction == 'd' && cv == 1) || (direction == 'l' && cv == 2) ||
        (direction == 'u' && cv == 3) || (direction == 'r' && cv == 4))
        {
            return 6;
        }
        else if ((direction == 'l' && cv == 1) || (direction == 'u' && cv == 2) ||
        (direction == 'r' && cv == 3) || (direction == 'd' && cv == 4))
        {
            return 2;
        }
        return 3;
    }
    else if (hoop_number == 4)
    {
        if ((direction == 'u' && cv == 1) || (direction == 'r' && cv == 2) ||
        (direction == 'd' && cv == 3) || (direction == 'l' && cv == 4)){
            return 1;
        }
        else if ((direction == 'r' && cv == 1) || (direction == 'd' && cv == 2) ||
        (direction == 'l' && cv == 3) || (direction == 'u' && cv == 4))
        {
            return 5;
        }
        else if ((direction == 'd' && cv == 1) || (direction == 'l' && cv == 2) ||
        (direction == 'u' && cv == 3) || (direction == 'r' && cv == 4))
        {
            return 7;
        }
        return 4;
    }
    else if (hoop_number == 5)
    {
        if ((direction == 'r' && cv == 1) || (direction == 'd' && cv == 2) ||
        (direction == 'l' && cv == 3) || (direction == 'u' && cv == 4)){
            return 6;
        }
        else if ((direction == 'd' && cv == 1) || (direction == 'l' && cv == 2) ||
        (direction == 'u' && cv == 3) || (direction == 'r' && cv == 4))
        {
            return 8;
        }
        else if ((direction == 'l' && cv == 1) || (direction == 'u' && cv == 2) ||
        (direction == 'r' && cv == 3) || (direction == 'd' && cv == 4))
        {
            return 4;
        }
        else if ((direction == 'u' && cv == 1) || (direction == 'r' && cv == 2) ||
        (direction == 'd' && cv == 3) || (direction == 'l' && cv == 4))
        {
            return 2;
        }
        return 5;
    }
    else if(hoop_number == 6)
    {
        if ((direction == 'u' && cv == 1) || (direction == 'r' && cv == 2) ||
        (direction == 'd' && cv == 3) || (direction == 'l' && cv == 4)){
            return 3;
        }
        else if ((direction == 'd' && cv == 1) || (direction == 'l' && cv == 2) ||
        (direction == 'u' && cv == 3) || (direction == 'r' && cv == 4))
        {
            return 9;
        }
        else if ((direction == 'l' && cv == 1) || (direction == 'u' && cv == 2) ||
        (direction == 'r' && cv == 3) || (direction == 'd' && cv == 4))
        {
            return 5;
        }
        return 6;
    }
    else if (hoop_number == 7)
    {
        if ((direction == 'r' && cv == 1) || (direction == 'd' && cv == 2) ||
        (direction == 'l' && cv == 3) || (direction == 'u' && cv == 4)){
            return 8;
        }
        else if ((direction == 'u' && cv == 1) || (direction == 'r' && cv == 2) ||
        (direction == 'd' && cv == 3) || (direction == 'l' && cv == 4))
        {
            return 4;
        }
        return 7;
    }
    else if (hoop_number == 8)
    {
        if ((direction == 'r' && cv == 1) || (direction == 'd' && cv == 2) ||
        (direction == 'l' && cv == 3) || (direction == 'u' && cv == 4)){
            return 9;
        }
        else if ((direction == 'u' && cv == 1) || (direction == 'r' && cv == 2) ||
        (direction == 'd' && cv == 3) || (direction == 'l' && cv == 4))
        {
            return 5;
        }
        else if ((direction == 'l' && cv == 1) || (direction == 'u' && cv == 2) ||
        (direction == 'r' && cv == 3) || (direction == 'd' && cv == 4))
        {
            return 7;
        }
        return 8;
    }
    else
    {
        if ((direction == 'l' && cv == 1) || (direction == 'u' && cv == 2) ||
        (direction == 'r' && cv == 3) || (direction == 'd' && cv == 4)){
            return 8;
        }
        else if ((direction == 'u' && cv == 1) || (direction == 'r' && cv == 2) ||
        (direction == 'd' && cv == 3) || (direction == 'l' && cv == 4))
        {
            return 6;
        }
        return 9;
    }
}



class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;

        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );

                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
          
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
          
        }`;
    }
}

