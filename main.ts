import {
	App,
	ColorComponent,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TextComponent,
	MarkdownView,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface BuJoStatesSettings {
	touchduration: number;
	halfBaseColour: string,
	halfHoverColour: string,
	migrBaseColour: string,
	migrHoverColour: string,
	schedBaseColour: string,
	schedHoverColour: string,
}

const DEFAULT_SETTINGS: BuJoStatesSettings = {
	// touch duration before third check/uncheck
	touchduration: 300,
	halfBaseColour: "#c77a0f",
	halfHoverColour: "#ff930a",
	migrBaseColour: "#2596be",
	migrHoverColour: "#65b3d2",
	schedBaseColour: "#28A326",
	schedHoverColour: "#45D042",
};

// timer var
let timer: ReturnType<typeof setTimeout>;
let longTouchDone = false;

export default class BuJoStates extends Plugin {
	settings: BuJoStatesSettings;

	// What to do onLoad Plugin
	async onload() {
		await this.loadSettings();

		// this add style html element to handle styles vars
		this.addStyle();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// Mouse event
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			const checkbox = Object(evt.target);

			if (
				checkbox.className === "task-list-item-checkbox" &&
				checkbox.dataset.task !== " " &&
				checkbox.dataset.task !== "<"
			) {
				evt.preventDefault();
				this.checkState(checkbox);
			} else if (
				evt.shiftKey &&
				checkbox.className === "task-list-item-checkbox"
				// trigger reset...
			) {
				new Notice("Triggering reset is not implemented yet...");
				console.error("Triggering reset is not implemented yet...");
			}
		});

		this.registerDomEvent(document, "touchend", (evt: TouchEvent) => {
			const checkbox = Object(evt.target);

			if (
				checkbox.className === "task-list-item-checkbox" &&
				checkbox.dataset.task !== " " &&
				checkbox.dataset.task !== "<"
			) {
				evt.preventDefault();
				this.checkState(checkbox);
			}
		});

		// // Touch Start Event
		// this.registerDomEvent(
		// 	document,
		// 	"touchstart",
		// 	(evt: TouchEvent) => {
		// 		const checkbox = Object(evt.target);
		// 		if (checkbox.className === "task-list-item-checkbox") {
		// 			timer = setTimeout(
		// 				this.onlongtouch,
		// 				this.settings.touchduration,
		// 				checkbox
		// 			);
		// 		}
		// 	},
		// 	{ passive: false }
		// );

		// // Touch End Event
		// this.registerDomEvent(document, "touchend", (evt: TouchEvent) => {
		// 	const checkbox = Object(evt.target);
		// 	if (checkbox.className === "task-list-item-checkbox") {
		// 		if (timer) clearTimeout(timer); // clearTimeout, not cleartimeout..
		// 		if (longTouchDone) {
		// 			evt.preventDefault();
		// 			longTouchDone = false;
		// 			return;
		// 		}
		// 	}
		// });
	}

	/**
	 * Dispatched function with timer onLongTouch. Duration see `touchduration`
	 * @param checkbox
	 */
	onlongtouch = function (checkbox: HTMLElement) {
		longTouchDone = true;
		if (checkbox.dataset.task !== "/") {
			checkbox.dataset.task = "/";
			Object(checkbox.closest(".HyperMD-list-line")).dataset.task = "/";
			("/");
		} else {
			checkbox.dataset.task = " ";
			Object(checkbox.closest(".HyperMD-list-line")).dataset.task = " ";
		}
		new Notice("Third state checkbox toggled!");
	};

	/**
	 * Check the state of the checkbox, call the right state changed.
	 * @param checkbox
	 */
	checkState = function (checkbox: HTMLElement) {
		if (checkbox.dataset.task === "x"){
			this.changeState(checkbox, '/');	
			// new Notice("Checkbox half completion toggled!");
		} else if (checkbox.dataset.task === "/"){
			this.changeState(checkbox, '>');	
			// new Notice("Checkbox migration toggled!");
		} else if (checkbox.dataset.task === ">"){
			this.changeState(checkbox, '<');	
			// new Notice("Checkbox scheduling toggled!");
		} 
	};

	/**
	 * Change the state of the checkbox.
	 * @param checkbox
	 * @param char
	 */
	changeState = function (checkbox: HTMLElement, char: String) {
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);

		const offset = view.editor.cm.posAtDOM(checkbox) - 2;
		const offset_end = offset + 1;

		const pos = view.editor.offsetToPos(offset);
		const pos_end = view.editor.offsetToPos(offset_end);

		view.editor.replaceRange(
			char,
			pos,
			pos_end,
		);

		this.app.workspace.trigger('editor:refresh');
	}

	// What to do onUnLoad Plugin
	onunload() {
		this.removeStyle();
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updateStyle();
	}

	/**
	 * Add style html element to handle styles vars
	 */
	addStyle() {
		// add a css block for our settings-dependent styles
		const css = document.createElement("style");
		css.id = "checkbox-BuJo-states";
		document.getElementsByTagName("head")[0].appendChild(css);

		// update the style with the settings-dependent styles
		this.updateStyle();
	}

	/**
	 * Update style to be store in header.
	 * Trigger by `addStyle` when plugin loading
	 * Trigger by the changing of configuration
	 */
	updateStyle() {
		// get the custom css element
		const el = document.getElementById("checkbox-BuJo-states");
		if (!el) throw "checkbox-BuJo-states element not found!";
		else {
			// set the settings-dependent css
			el.innerText =
				":root {" +
				"--checkbox-half-state: " +
				this.settings.halfBaseColour +
				";" +
				"--checkbox-half-state-accent: " +
				this.settings.halfHoverColour +
				";" +
				"--checkbox-migr-state: " +
				this.settings.migrBaseColour +
				";" +
				"--checkbox-migr-state-accent: " +
				this.settings.migrHoverColour +
				";" +
				"--checkbox-sched-state: " +
				this.settings.schedBaseColour +
				";" +
				"--checkbox-sched-state-accent: " +
				this.settings.schedHoverColour +
				";" +
				"--checkbox-half-color: var(--checkbox-half-state);" +
				"--checkbox-half-color-hover: var(--checkbox-half-state-accent);" +
				"--checkbox-migr-color: var(--checkbox-migr-state);" +
				"--checkbox-migr-color-hover: var(--checkbox-migr-state-accent);" +
				"--checkbox-sched-color: var(--checkbox-sched-state);" +
				"--checkbox-sched-color-hover: var(--checkbox-sched-state-accent);" +
				"}";
		}
	}

	// Clean html head on unload of plugin
	removeStyle() {
		const element = document.getElementById("checkbox-BuJo-states");
		if (element) {
			element.remove();
		}
	}
}

/**
 * Configuration of settings pan
 */
class SampleSettingTab extends PluginSettingTab {
	plugin: BuJoStates;

	constructor(app: App, plugin: BuJoStates) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", {
			text: "Checkbox BuJo states plugin - Settings",
		});

		const halfBaseColourCustomization = new Setting(containerEl)
			.setName("Half completed state base color")
			.setDesc(
				"The color of the checkbox Default value: " +
					DEFAULT_SETTINGS.halfBaseColour
			);
		const halfBaseColourPicker = new ColorComponent(
		halfBaseColourCustomization.controlEl
		)
		.setValue(this.plugin.settings.halfBaseColour)
		.onChange(async (value) => {
			this.plugin.settings.halfBaseColour = value;
			halfBaseTextValue.setValue(value);
			await this.plugin.saveSettings();
			this.plugin.loadSettings();
		});
		const halfBaseTextValue = new TextComponent(
			halfBaseColourCustomization.controlEl
		)
		.setPlaceholder("Hexa value")
		.setValue(this.plugin.settings.halfBaseColour)
		.onChange(async (value) => {
			this.plugin.settings.halfBaseColour = value;
			halfBaseColourPicker.setValue(value);
			await this.plugin.saveSettings();
		});
		halfBaseColourCustomization.addButton((bt) => {
			bt.setButtonText("Default").onClick(async () => {
				this.plugin.settings.halfBaseColour = DEFAULT_SETTINGS.halfBaseColour;
				halfBaseColourPicker.setValue(DEFAULT_SETTINGS.halfBaseColour);
				halfBaseTextValue.setValue(DEFAULT_SETTINGS.halfBaseColour);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		});

		halfBaseColourCustomization.components.push(halfBaseColourPicker, halfBaseTextValue);

		const halfHoverColourCustomization = new Setting(containerEl)
			.setName("Half completed state hover color")
			.setDesc(
				"The color of the checkbox when your cursor is over. Default value: " +
					DEFAULT_SETTINGS.halfHoverColour
			);
		const halfHoverColourPicker = new ColorComponent(
			halfHoverColourCustomization.controlEl
		)
			.setValue(this.plugin.settings.halfHoverColour)
			.onChange(async (value) => {
				this.plugin.settings.halfHoverColour = value;
				halfHoverTextValue.setValue(value);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		const halfHoverTextValue = new TextComponent(
			halfHoverColourCustomization.controlEl
		)
			.setPlaceholder("Hexa value")
			.setValue(this.plugin.settings.halfHoverColour)
			.onChange(async (value) => {
				this.plugin.settings.halfHoverColour = value;
				halfHoverColourPicker.setValue(value);
				await this.plugin.saveSettings();
			});
		halfHoverColourCustomization.addButton((bt) => {
			bt.setButtonText("Default").onClick(async () => {
				this.plugin.settings.halfHoverColour = DEFAULT_SETTINGS.halfHoverColour;
				halfHoverColourPicker.setValue(DEFAULT_SETTINGS.halfHoverColour);
				halfHoverTextValue.setValue(DEFAULT_SETTINGS.halfHoverColour);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		});

		halfHoverColourCustomization.components.push(
			halfHoverColourPicker,
			halfHoverTextValue
		);
		const migrBaseColourCustomization = new Setting(containerEl)
			.setName("Migration state base color")
			.setDesc(
				"The color of the checkbox Default value: " +
					DEFAULT_SETTINGS.migrBaseColour
			);
		const migrBaseColourPicker = new ColorComponent(
		migrBaseColourCustomization.controlEl
		)
		.setValue(this.plugin.settings.migrBaseColour)
		.onChange(async (value) => {
			this.plugin.settings.migrBaseColour = value;
			migrBaseTextValue.setValue(value);
			await this.plugin.saveSettings();
			this.plugin.loadSettings();
		});
		const migrBaseTextValue = new TextComponent(
			migrBaseColourCustomization.controlEl
		)
		.setPlaceholder("Hexa value")
		.setValue(this.plugin.settings.migrBaseColour)
		.onChange(async (value) => {
			this.plugin.settings.migrBaseColour = value;
			migrBaseColourPicker.setValue(value);
			await this.plugin.saveSettings();
		});
		migrBaseColourCustomization.addButton((bt) => {
			bt.setButtonText("Default").onClick(async () => {
				this.plugin.settings.migrBaseColour = DEFAULT_SETTINGS.migrBaseColour;
				migrBaseColourPicker.setValue(DEFAULT_SETTINGS.migrBaseColour);
				migrBaseTextValue.setValue(DEFAULT_SETTINGS.migrBaseColour);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		});

		migrBaseColourCustomization.components.push(migrBaseColourPicker, migrBaseTextValue);

		const migrHoverColourCustomization = new Setting(containerEl)
			.setName("Migration state hover color")
			.setDesc(
				"The color of the checkbox when your cursor is over. Default value: " +
					DEFAULT_SETTINGS.migrHoverColour
			);
		const migrHoverColourPicker = new ColorComponent(
			migrHoverColourCustomization.controlEl
		)
			.setValue(this.plugin.settings.migrHoverColour)
			.onChange(async (value) => {
				this.plugin.settings.migrHoverColour = value;
				migrHoverTextValue.setValue(value);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		const migrHoverTextValue = new TextComponent(
			migrHoverColourCustomization.controlEl
		)
			.setPlaceholder("Hexa value")
			.setValue(this.plugin.settings.migrHoverColour)
			.onChange(async (value) => {
				this.plugin.settings.migrHoverColour = value;
				migrHoverColourPicker.setValue(value);
				await this.plugin.saveSettings();
			});
		migrHoverColourCustomization.addButton((bt) => {
			bt.setButtonText("Default").onClick(async () => {
				this.plugin.settings.migrHoverColour = DEFAULT_SETTINGS.migrHoverColour;
				migrHoverColourPicker.setValue(DEFAULT_SETTINGS.migrHoverColour);
				migrHoverTextValue.setValue(DEFAULT_SETTINGS.migrHoverColour);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		});

		migrHoverColourCustomization.components.push(
			migrHoverColourPicker,
			migrHoverTextValue
		);

		const schedBaseColourCustomization = new Setting(containerEl)
			.setName("Schedule state base color")
			.setDesc(
				"The color of the checkbox Default value: " +
					DEFAULT_SETTINGS.schedBaseColour
			);
		const schedBaseColourPicker = new ColorComponent(
		schedBaseColourCustomization.controlEl
		)
		.setValue(this.plugin.settings.schedBaseColour)
		.onChange(async (value) => {
			this.plugin.settings.schedBaseColour = value;
			schedBaseTextValue.setValue(value);
			await this.plugin.saveSettings();
			this.plugin.loadSettings();
		});
		const schedBaseTextValue = new TextComponent(
			schedBaseColourCustomization.controlEl
		)
		.setPlaceholder("Hexa value")
		.setValue(this.plugin.settings.schedBaseColour)
		.onChange(async (value) => {
			this.plugin.settings.schedBaseColour = value;
			schedBaseColourPicker.setValue(value);
			await this.plugin.saveSettings();
		});
		schedBaseColourCustomization.addButton((bt) => {
			bt.setButtonText("Default").onClick(async () => {
				this.plugin.settings.schedBaseColour = DEFAULT_SETTINGS.schedBaseColour;
				schedBaseColourPicker.setValue(DEFAULT_SETTINGS.schedBaseColour);
				schedBaseTextValue.setValue(DEFAULT_SETTINGS.schedBaseColour);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		});

		schedBaseColourCustomization.components.push(schedBaseColourPicker, schedBaseTextValue);

		const schedHoverColourCustomization = new Setting(containerEl)
			.setName("Schedule state hover color")
			.setDesc(
				"The color of the checkbox when your cursor is over. Default value: " +
					DEFAULT_SETTINGS.schedHoverColour
			);
		const schedHoverColourPicker = new ColorComponent(
			schedHoverColourCustomization.controlEl
		)
			.setValue(this.plugin.settings.schedHoverColour)
			.onChange(async (value) => {
				this.plugin.settings.schedHoverColour = value;
				schedHoverTextValue.setValue(value);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		const schedHoverTextValue = new TextComponent(
			schedHoverColourCustomization.controlEl
		)
			.setPlaceholder("Hexa value")
			.setValue(this.plugin.settings.schedHoverColour)
			.onChange(async (value) => {
				this.plugin.settings.schedHoverColour = value;
				schedHoverColourPicker.setValue(value);
				await this.plugin.saveSettings();
			});
		schedHoverColourCustomization.addButton((bt) => {
			bt.setButtonText("Default").onClick(async () => {
				this.plugin.settings.schedHoverColour = DEFAULT_SETTINGS.schedHoverColour;
				schedHoverColourPicker.setValue(DEFAULT_SETTINGS.schedHoverColour);
				schedHoverTextValue.setValue(DEFAULT_SETTINGS.schedHoverColour);
				await this.plugin.saveSettings();
				this.plugin.loadSettings();
			});
		});

		schedHoverColourCustomization.components.push(
			schedHoverColourPicker,
			schedHoverTextValue
		);
	}
}
