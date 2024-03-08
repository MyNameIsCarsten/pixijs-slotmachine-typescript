import { Application, Assets, BlurFilter, Color, Container, FillGradient, Graphics, Renderer, Sprite, Text, TextStyle, Texture } from 'pixi.js';


(async () => {

	const app: Application<Renderer> = new Application<Renderer>();
	await app.init({ 
		resolution: window.devicePixelRatio || 1,
		autoDensity: true,
		backgroundColor: 0x6495ed,
		// resizeTo: window,
		width: 800,
        height: Math.max(1, window.innerHeight),
	});

	document.body.appendChild(app.canvas);

	await Assets.load([
		'https://pixijs.com/assets/eggHead.png',
		'https://pixijs.com/assets/flowerTop.png',
		'https://pixijs.com/assets/helmlok.png',
		'https://pixijs.com/assets/skully.png',
	]);

	const SYMBOL_SIZE = 150;
	const REEL_WIDTH = 800 / 5;

	// Create different slot symbols
	const slotTextures = [
		Texture.from('https://pixijs.com/assets/eggHead.png'),
		Texture.from('https://pixijs.com/assets/flowerTop.png'),
		Texture.from('https://pixijs.com/assets/helmlok.png'),
		Texture.from('https://pixijs.com/assets/skully.png'),
	];

	type Reel = {
		container: Container,
		icons: Sprite[],
		position: number,
		previousPosition: number,
		blur: BlurFilter
	}

	// Build the reels
	const reels: Reel[] =  [];

	const reelsContainer: Container = new Container();

	const numReels = 5;

	// Create each reel
	for(let i = 0; i <numReels; i++){

		const reelContainer = new Container();
		reelContainer.x = i * REEL_WIDTH;

		// reel object
		const reel: Reel = {
			container: reelContainer,
			icons: [],
			position: 0,
			previousPosition: 0,
			blur: new BlurFilter(),
		}
	
		for (let j = 0; j < 4; j++){
			// Choose random icon
			const icon: Sprite = new Sprite( slotTextures[Math.floor(Math.random() * slotTextures.length)] );
			
			// Resize icon
			icon.y = SYMBOL_SIZE * j;
			icon.scale.x = icon.scale.y = Math.min(SYMBOL_SIZE / icon.width, SYMBOL_SIZE / icon.height);
			icon.x = Math.round((SYMBOL_SIZE - icon.width) / 2);

			// Add icon to reel list
			reel.icons.push(icon);

			// Add icon to reelContainer
			reelContainer.addChild(icon);
		}

		// Add current reelContainer to reelsContainer
		reelsContainer.addChild(reelContainer);

		// After reel object is created/modified, we push it to reels list
		reels.push(reel);
		
	}
	// Add reelContainer to app stage, making them visible
	app.stage.addChild(reelsContainer);
	

	// Build top & bottom covers and position reelContainer
	const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;

	reelsContainer.y = margin;
	reelsContainer.x = Math.round(app.screen.width - REEL_WIDTH * 5);

	// Top Cover
	const top = new Graphics().rect(0, 0, app.screen.width, margin).fill({ color: 0x0 });
	app.stage.addChild(top);

	// Bottom Cover
	const bottom = new Graphics().rect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin).fill({ color: 0x0 });
	app.stage.addChild(bottom);


	// Create gradient fill
    const fill: FillGradient = new FillGradient(0, 0, 0, 36 * 1.7);

    const colors: number[] = [0xffffff, 0x00ff99].map((color) => Color.shared.setValue(color).toNumber());

    colors.forEach((number, index) =>
    {
        const ratio = index / colors.length;

        fill.addColorStop(ratio, number);
    });

	// Create style for text
	const style: TextStyle = new TextStyle({
		fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
		stroke: {
			color: 0x000000,
			width: 5
		},
		fill: { fill },
		dropShadow: {
            color: 0x000000,
            angle: Math.PI / 6,
            blur: 4,
            distance: 6,
        },
        wordWrap: true,
        wordWrapWidth: 440,
	});

	// Create bottom text
	const bottomText: Text = new Text('Spin the wheels!', style);
    bottomText.x = Math.round((bottom.width - bottomText.width) / 2);
    bottomText.y = app.screen.height - margin + Math.round((margin - bottomText.height) / 2);
    bottom.addChild(bottomText);

	// Add top text
	const topText: Text = new Text('PIXI MONSTER SLOTS!', style);

	topText.x = Math.round((top.width - topText.width) / 2);
	topText.y = Math.round((margin - topText.height) / 2);
	top.addChild(topText);

	app.stage.addChild(top);
	app.stage.addChild(bottom);

	// Set interactivity
	bottom.eventMode = 'static';
	bottom.cursor = 'pointer';
	bottom.addEventListener('pointerup', () => {
		startPlay();
	})

	// Is Game running or not?
	let running: boolean = false;

	// Function to start playing
	function startPlay(){
		if(running) return;
		running = true;

		for(let i = 0; i < reels.length; i++){
			// Current reel
			const r = reels[i];

			const extra = Math.floor(Math.random() * 3);
			const target = r.position + 10 + i * 5 + extra;
			const time = 2500 + i * 600 +  extra * 600;
			
			tweenTo(r, 'position', target, time, backout(0.5), null, i === reels.length-1 ? reelsComplete : null);
		}

	
	};

		// Reels done handler.
    function reelsComplete(): void
    {
        running = false;
    }

	// Listen for animate update.
	app.ticker.add(() => {

		// Update the slots
		for(let i = 0; i < reels.length; i++){
			// Current reel
			const r = reels[i];

			// Update blur filter y amount based on speed.
            // This would be better if calculated with time in mind also. Now blur depends on frame rate.
			r.blur.blurY = (r.position - r.previousPosition) * 8;
			r.previousPosition = r.position;

			// Update icons position on reel
			for(let j = 0; j < r.icons.length; j++){
				// Current icon
				const s = r.icons[j];
				const prevy = s.y;

				s.y = ((r.position + j) % r.icons.length) * SYMBOL_SIZE - SYMBOL_SIZE;

				// Detect going over 
				if(s.y < 0 && prevy > SYMBOL_SIZE){
					// Swap a texture.
                    // This should in proper product be determined from some logical reel.
					s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
					s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
				}
			}
		}
	});

	type ReelProperty = keyof Reel;

	// Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
	type Tween = {
		object: Reel, 
		property: ReelProperty, 
		propertyBeginValue: number | Container | BlurFilter | Sprite[];
		target: number, 
		time: number, 
		easing: (t: any) => number, 
		change: ((tween: Tween) => void) | null, 
		complete: ((tween: Tween) => void) | null,
		start: number
	}

	const tweening: Tween[] = [];

	function tweenTo(object: Reel, property: ReelProperty, target: number, time: number, easing: (t: any) => number, onchange: null, oncomplete: (() => void) | null){
		
		const propertyBeginValue: number | Container | BlurFilter | Sprite[] = object[property];

		const tween = {
			object,
			property,
			propertyBeginValue,
			target,
			easing,
			time,
			change: onchange,
			complete: oncomplete,
			start: Date.now(),
		};

		tweening.push(tween);

		return tween;
	}

	// Listen for animate update
	app.ticker.add(()=> {
		const now = Date.now();
		const remove = [];

		for(let i = 0; i < tweening.length; i++){

			const t = tweening[i];
			const phase = Math.min(1, (now - t.start) / t.time);

			if (t.property == 'position'){
				t.object[t.property] = lerp(t.propertyBeginValue as number, t.target, t.easing(phase));
			} else {
				throw new Error('\'position\' should be used as property for tweenTo');
			}

			if(t.change) t.change(t);
			if(phase === 1){
				t.object[t.property] = t.target;
				if (t.complete) t.complete(t);
				remove.push(t);
			}
		}
		for(let i = 0; i < remove.length; i++){
			tweening.splice(tweening.indexOf(remove[i]), 1);
		}

	});
	
	// Basic lerp funtion.
    function lerp(a1: number, a2: number, t: number): number
    {
        return a1 * (1 - t) + a2 * t;
    }

	// Backout function from tweenjs.
    // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
    function backout(amount: number): (t: any) => number
    {
        return (t: any) => --t * t * ((amount + 1) * t + amount) + 1;
    }

})();