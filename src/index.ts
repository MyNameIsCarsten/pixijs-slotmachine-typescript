import { Application, Assets, Color, Container, FillGradient, Graphics, Renderer, Sprite, Text, TextStyle, Texture } from 'pixi.js';


(async () => {

	const app: Application<Renderer> = new Application<Renderer>();
	await app.init({ 
		resolution: window.devicePixelRatio || 1,
		autoDensity: true,
		backgroundColor: 0x6495ed,
		resizeTo: window 
	});

	document.body.appendChild(app.canvas);

	await Assets.load([
		'https://pixijs.com/assets/eggHead.png',
		'https://pixijs.com/assets/flowerTop.png',
		'https://pixijs.com/assets/helmlok.png',
		'https://pixijs.com/assets/skully.png',
	]);

	const SYMBOL_SIZE = 150;
	const REEL_WIDTH = 160;

	// Create different slot symbols
	const slotTextures = [
		Texture.from('https://pixijs.com/assets/eggHead.png'),
		Texture.from('https://pixijs.com/assets/flowerTop.png'),
		Texture.from('https://pixijs.com/assets/helmlok.png'),
		Texture.from('https://pixijs.com/assets/skully.png'),
	];

	type Reel = {
		container: Container,
		icons: Sprite[]
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
			// position: 0,
			// previousPosition: 0,
			// blur: new BlurFilter(),
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
		console.log('Gotcha!');
	})

	// Is Game running or not?
	//let running: boolean = false;


})();