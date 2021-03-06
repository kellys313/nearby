/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
import { subclass, declared, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Share from '../components/Share/Share';
import ShareFeatures from '../components/Share/Share/ShareFeatures';
import watchUtils = require('esri/core/watchUtils');
import Handles = require('esri/core/Handles');
import { tsx } from 'esri/widgets/support/widget';
import i18n = require('dojo/i18n!../nls/resources');

import esri = __esri;
type State = 'ready' | 'loading';

const CSS = {
	calciteStyles: {
		right: 'right',
		left: 'left',
		fontSize2: 'font-size--2',
		paddingTrailer: 'padding-right-1',
		panel: 'panel',
		panelNoPadding: 'panel-no-padding',
		btn: 'btn',
		btnFill: 'btn-fill',
		btnTransparent: 'btn-transparent',
		phoneHide: 'phone-hide'
	},
	svgIcon: 'svg-icon',
	detailsTitle: 'details-title',
	detailsContent: 'details-content',
	hide: 'hide',
	details: 'detail'
};

export interface DetailPanelProps extends esri.WidgetProperties {
	title: string;
	content: string;
	sharing: boolean;
	view: esri.MapView;
}

@subclass('app.DetailPanel')
class DetailPanel extends declared(Widget) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------
	@property() title: string;

	@property() content: string;
	@property() sharing: boolean;
	@property() shareWidget: Share = null;
	@property() view: esri.MapView = null;

	private _handles: Handles = new Handles();

	//----------------------------------
	//
	//  state - readOnly
	//
	//----------------------------------
	@property({
		dependsOn: ['view.ready'],
		readOnly: true
	})
	get state(): State {
		const ready = this.get('view.ready');
		return ready ? 'ready' : 'loading';
	}

	constructor(props: DetailPanelProps) {
		super();
	}
	initialize() {
		if (this.sharing) {
			const setupShare = 'setup-share';
			this._handles.add(
				watchUtils.whenOnce(this, 'view.ready', () => {
					const shareFeatures = new ShareFeatures({
						copyToClipboard: true,
						embedMap: false
					});

					this.shareWidget = new Share({
						view: this.view,
						shareFeatures,
						container: document.createElement('div'),
						isDefault: true
					});

					this._handles.remove(setupShare);
				}),
				setupShare
			);
		}
	}
	destroy() {
		this._handles.removeAll();
		this._handles = null;
	}

	render() {
		const socialShare =
			this.sharing && this.shareWidget ? (
				<div
					bind={this.shareWidget.container}
					afterCreate={this._attachToNode}
					class={this.classes(CSS.calciteStyles.phoneHide)}
				/>
			) : null;
		return (
			<div bind={this} class={this.classes(CSS.calciteStyles.panel, CSS.calciteStyles.panelNoPadding)}>
				<button
					bind={this}
					aria-label={i18n.tools.close}
					title={i18n.tools.close}
					onclick={this.hidePanel}
					class={this.classes(
						CSS.details,
						CSS.calciteStyles.right,
						CSS.calciteStyles.btn,
						CSS.calciteStyles.btnTransparent
					)}
				>
					<svg class={this.classes(CSS.svgIcon)} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M18.404 16l9.9 9.9-2.404 2.404-9.9-9.9-9.9 9.9L3.696 25.9l9.9-9.9-9.9-9.898L6.1 3.698l9.9 9.899 9.9-9.9 2.404 2.406-9.9 9.898z" /></svg>
				</button>
				<h3 class={this.classes(CSS.detailsTitle)}>{this.title}</h3>
				<p class={this.classes(CSS.detailsContent)} innerHTML={this.content} />
				{socialShare}
			</div>
		);
	}
	public hidePanel() {
		const container = this.container as HTMLElement;
		container.classList.add("hide");
	}
	public showPanel() {
		// Check local storage 
		const container = this.container as HTMLElement;
		container.classList.remove("hide");
	}

	_attachToNode(this: HTMLElement, node: HTMLElement): void {
		const content: HTMLElement = this;
		node.appendChild(content);
	}

}

export default DetailPanel;
