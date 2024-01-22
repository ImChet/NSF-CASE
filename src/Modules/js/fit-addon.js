class FitAddon {
    activate(terminal) {
        this._terminal = terminal;
    }

    dispose() {}

    fit() {
        const dimensions = this.proposeDimensions();
        if (!dimensions || !this._terminal || isNaN(dimensions.cols) || isNaN(dimensions.rows)) return;
        const core = this._terminal._core;
        if (this._terminal.rows !== dimensions.rows || this._terminal.cols !== dimensions.cols) {
            core._renderService.clear();
            this._terminal.resize(dimensions.cols, dimensions.rows);
        }
    }

    proposeDimensions() {
        if (!this._terminal) return;
        if (!this._terminal.element || !this._terminal.element.parentElement) return;
        const core = this._terminal._core;
        const dimensions = core._renderService.dimensions;
        if (dimensions.css.cell.width === 0 || dimensions.css.cell.height === 0) return;
        const scrollbarWidth = this._terminal.options.scrollback === 0 ? 0 : core.viewport.scrollBarWidth;
        const parentStyle = window.getComputedStyle(this._terminal.element.parentElement);
        const height = parseInt(parentStyle.getPropertyValue("height"));
        const width = Math.max(0, parseInt(parentStyle.getPropertyValue("width")));
        const terminalStyle = window.getComputedStyle(this._terminal.element);
        const availableHeight = height - (parseInt(terminalStyle.getPropertyValue("padding-top")) + parseInt(terminalStyle.getPropertyValue("padding-bottom")));
        const availableWidth = width - (parseInt(terminalStyle.getPropertyValue("padding-right")) + parseInt(terminalStyle.getPropertyValue("padding-left"))) - scrollbarWidth;
        return {
            cols: Math.max(2, Math.floor(availableWidth / dimensions.css.cell.width)),
            rows: Math.max(1, Math.floor(availableHeight / dimensions.css.cell.height))
        };
    }
}

// Export the FitAddon class
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = FitAddon;
} else {
    window.FitAddon = FitAddon;
}
