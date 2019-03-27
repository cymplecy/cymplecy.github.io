/*
  scratch3_ftduino/index.js

  WebUSB based ftDuino extension for scratch3

  (c) 2019 by Till Harbaum <till@harbaum.org>

  http://ftduino.de
*/

const formatMessage = require('format-message');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

// a set of very simple routines giving access to the ftDuinos serial USB port
var serial = {};

(function() {
    'use strict';

    serial.getPorts = function() {
	return navigator.usb.getDevices().then(devices => {
	    return devices.map(device => new serial.Port(device));
	});
    };
    
    serial.requestPort = function() {
	const filters = [
	    // ftDuino USB IDs
	    { 'vendorId': 0x1c40, 'productId': 0x0538 },
	];
	return navigator.usb.requestDevice({ 'filters': filters }).then(
	    device => new serial.Port(device)
	);
    }
    
    serial.Port = function(device) {
	this.device_ = device;
    };
    
    serial.Port.prototype.connect = function() {
	let readLoop = () => {
	    this.device_.transferIn(5, 64).then(result => {
		this.onReceive(result.data);
		readLoop();
	    }, error => {
		this.onReceiveError(error);
	    });
	};
	
	return this.device_.open()
            .then(() => {
		if (this.device_.configuration === null) {
		    return this.device_.selectConfiguration(1);
		}
            })
            .then(() => this.device_.claimInterface(2))
            .then(() => this.device_.selectAlternateInterface(2, 0))
            .then(() => this.device_.controlTransferOut({
		'requestType': 'class',
		'recipient': 'interface',
		'request': 0x22,
		'value': 0x01,
		'index': 0x02}))
            .then(() => {
		readLoop();
            });
    };
    
    serial.Port.prototype.disconnect = function() {
	return this.device_.controlTransferOut({
            'requestType': 'class',
            'recipient': 'interface',
            'request': 0x22,
            'value': 0x00,
            'index': 0x02})
            .then(() => this.device_.close());
    };
    
    serial.Port.prototype.send = function(data) {
	return this.device_.transferOut(4, data);
    };
})();


/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CjxtZXRhZGF0YT4KPHJkZjpSREY+CjxjYzpXb3JrIHJkZjphYm91dD0iIj4KPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CjxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz4KPGRjOnRpdGxlLz4KPC9jYzpXb3JrPgo8L3JkZjpSREY+CjwvbWV0YWRhdGE+CjxzdHlsZT4uc3Qye2ZpbGw6cmVkfS5zdDN7ZmlsbDojZTBlMGUwfS5zdDR7ZmlsbDpub25lO3N0cm9rZTojNjY2O3N0cm9rZS13aWR0aDouNTtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCguMTI1MjYgMCAwIC4xMjUyNiAtNTEuNTcyIC0xMC40ODkpIj4KPHJlY3QgeD0iNDE3LjQ4IiB5PSI4OS40OTkiIHdpZHRoPSIzMDguMjciIGhlaWdodD0iMzA4LjI3IiBmaWxsPSIjYjliOWI5IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxMC42MyIvPgo8cmVjdCB4PSI0MjYuMTMiIHk9Ijk4LjE5OCIgd2lkdGg9IjI4OS43MyIgaGVpZ2h0PSIyODkuNzMiIGZpbGw9IiNhNmQ5YWIiLz4KPHJlY3QgeD0iNTYxLjc0IiB5PSI5Ny44OTEiIHdpZHRoPSIzNS40MzMiIGhlaWdodD0iMzUuNDMzIi8+CjxyZWN0IHg9IjQ3OC43OCIgeT0iOTguMTQxIiB3aWR0aD0iMzEuMTgxIiBoZWlnaHQ9IjMyLjAwOCIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iLjcwODY2Ii8+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDQxMi40MyAtNjYwLjEzKSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj4KPGNpcmNsZSBjeD0iMjUuMzI5IiBjeT0iMTAzNS4yIiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSBjeD0iMjUuMzI5IiBjeT0iMTAwOC43IiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSBjeD0iMjUuMzI5IiBjeT0iOTgyLjA4IiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSBjeD0iMjUuMzI5IiBjeT0iOTU1LjUiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIGN4PSIyNS4zMjkiIGN5PSI5MjguOTMiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIGN4PSIyNS4zMjkiIGN5PSI5MDIuMzUiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIGN4PSIyNS4zMjkiIGN5PSI4NzUuNzgiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIGN4PSIyNS4zMjkiIGN5PSI4NDkuMiIgcj0iNy4wNDY5IiBmaWxsPSIjYjdiN2I3IiBzdHJva2U9IiM0OTQ5NDkiIHN0cm9rZS13aWR0aD0iMS43NzE3Ii8+CjxjaXJjbGUgY3g9Ijc4LjQ3OCIgY3k9IjEwMzUuMiIgcj0iNy4wNDY5IiBmaWxsPSIjYjdiN2I3IiBzdHJva2U9IiM0OTQ5NDkiIHN0cm9rZS13aWR0aD0iMS43NzE3Ii8+CjxjaXJjbGUgY3g9IjUxLjkwNCIgY3k9IjEwMzUuMiIgcj0iNy4wNDY5IiBmaWxsPSIjYjdiN2I3IiBzdHJva2U9IiM0OTQ5NDkiIHN0cm9rZS13aWR0aD0iMS43NzE3Ii8+CjxjaXJjbGUgY3g9IjUxLjkwNCIgY3k9IjEwMDguNyIgcj0iNy4wNDY5IiBmaWxsPSIjYjdiN2I3IiBzdHJva2U9IiM0OTQ5NDkiIHN0cm9rZS13aWR0aD0iMS43NzE3Ii8+CjxjaXJjbGUgY3g9IjUxLjkwNCIgY3k9Ijk4Mi4wOCIgcj0iNy4wNDY5IiBmaWxsPSIjYjdiN2I3IiBzdHJva2U9IiM0OTQ5NDkiIHN0cm9rZS13aWR0aD0iMS43NzE3Ii8+CjxjaXJjbGUgY3g9IjUxLjkwNCIgY3k9Ijk1NS41IiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSBjeD0iNTEuOTA0IiBjeT0iOTI4LjkzIiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSBjeD0iNTEuOTA0IiBjeT0iOTAyLjM1IiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSBjeD0iNTEuOTA0IiBjeT0iODc1Ljc4IiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSBjeD0iNTEuOTA0IiBjeT0iODQ5LjIiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIHRyYW5zZm9ybT0ic2NhbGUoLTEsMSkiIGN4PSItMjkxLjA4IiBjeT0iMTAzNS4yIiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSB0cmFuc2Zvcm09InNjYWxlKC0xLDEpIiBjeD0iLTI5MS4wOCIgY3k9IjEwMDguNyIgcj0iNy4wNDY5IiBmaWxsPSIjYjdiN2I3IiBzdHJva2U9IiM0OTQ5NDkiIHN0cm9rZS13aWR0aD0iMS43NzE3Ii8+CjxjaXJjbGUgdHJhbnNmb3JtPSJzY2FsZSgtMSwxKSIgY3g9Ii0yOTEuMDgiIGN5PSI5ODIuMDgiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIHRyYW5zZm9ybT0ic2NhbGUoLTEsMSkiIGN4PSItMjkxLjA4IiBjeT0iOTU1LjUiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIHRyYW5zZm9ybT0ic2NhbGUoLTEsMSkiIGN4PSItMjkxLjA4IiBjeT0iOTI4LjkzIiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSB0cmFuc2Zvcm09InNjYWxlKC0xLDEpIiBjeD0iLTI5MS4wOCIgY3k9IjkwMi4zNSIgcj0iNy4wNDY5IiBmaWxsPSIjYjdiN2I3IiBzdHJva2U9IiM0OTQ5NDkiIHN0cm9rZS13aWR0aD0iMS43NzE3Ii8+CjxjaXJjbGUgdHJhbnNmb3JtPSJzY2FsZSgtMSwxKSIgY3g9Ii0yOTEuMDgiIGN5PSI4NzUuNzgiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIHRyYW5zZm9ybT0ic2NhbGUoLTEsMSkiIGN4PSItMjkxLjA4IiBjeT0iODQ5LjIiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIHRyYW5zZm9ybT0ic2NhbGUoLTEsMSkiIGN4PSItMjM3LjkzIiBjeT0iMTAzNS4yIiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSB0cmFuc2Zvcm09InNjYWxlKC0xLDEpIiBjeD0iLTI2NC41IiBjeT0iMTAzNS4yIiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSB0cmFuc2Zvcm09InNjYWxlKC0xLDEpIiBjeD0iLTI2NC41IiBjeT0iMTAwOC43IiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSB0cmFuc2Zvcm09InNjYWxlKC0xLDEpIiBjeD0iLTI2NC41IiBjeT0iOTgyLjA4IiByPSI3LjA0NjkiIGZpbGw9IiNiN2I3YjciIHN0cm9rZT0iIzQ5NDk0OSIgc3Ryb2tlLXdpZHRoPSIxLjc3MTciLz4KPGNpcmNsZSB0cmFuc2Zvcm09InNjYWxlKC0xLDEpIiBjeD0iLTI2NC41IiBjeT0iOTU1LjUiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIHRyYW5zZm9ybT0ic2NhbGUoLTEsMSkiIGN4PSItMjY0LjUiIGN5PSI5MjguOTMiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIHRyYW5zZm9ybT0ic2NhbGUoLTEsMSkiIGN4PSItMjY0LjUiIGN5PSI5MDIuMzUiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIHRyYW5zZm9ybT0ic2NhbGUoLTEsMSkiIGN4PSItMjY0LjUiIGN5PSI4NzUuNzgiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIHRyYW5zZm9ybT0ic2NhbGUoLTEsMSkiIGN4PSItMjY0LjUiIGN5PSI4NDkuMiIgcj0iNy4wNDY5IiBmaWxsPSIjYjdiN2I3IiBzdHJva2U9IiM0OTQ5NDkiIHN0cm9rZS13aWR0aD0iMS43NzE3Ii8+CjxjaXJjbGUgdHJhbnNmb3JtPSJzY2FsZSgtMSwxKSIgY3g9Ii0yNjguMDUiIGN5PSI3NzEuMjUiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIHRyYW5zZm9ybT0ic2NhbGUoLTEsMSkiIGN4PSItMjM5LjciIGN5PSI3NzEuMjUiIHI9IjcuMDQ2OSIgZmlsbD0iI2I3YjdiNyIgc3Ryb2tlPSIjNDk0OTQ5IiBzdHJva2Utd2lkdGg9IjEuNzcxNyIvPgo8Y2lyY2xlIGN4PSIzNy43MyIgY3k9Ijc3MS4yNSIgcj0iNi43MzIzIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iLjcwODY2Ii8+CjwvZz4KPHJlY3QgeD0iNTQ0LjQ5IiB5PSIzNDUuODMiIHdpZHRoPSI1NS45ODQiIGhlaWdodD0iMzQuNzI0IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyLjEyNiIvPgo8Y2lyY2xlIGN4PSI1MjQuNzMiIGN5PSIxMTIuNDMiIHI9IjYuNDIwOSIgZmlsbD0iIzBmZjQwMCIgc3Ryb2tlPSIjMDA1NDA3IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMS41OTQ3Ii8+CjxjaXJjbGUgY3g9IjU0NC42OSIgY3k9IjExMi4zOSIgcj0iNi40NjAyIiBmaWxsPSIjZmY2MDYwIiBzdHJva2U9IiM5YTAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIxLjYwNDQiLz4KPC9nPgo8L3N2Zz4K';

const ftduinoDisconnectedIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CjxtZXRhZGF0YT4KPHJkZjpSREY+CjxjYzpXb3JrIHJkZjphYm91dD0iIj4KPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CjxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz4KPGRjOnRpdGxlLz4KPC9jYzpXb3JrPgo8L3JkZjpSREY+CjwvbWV0YWRhdGE+CjxzdHlsZT4uc3Qye2ZpbGw6cmVkfS5zdDN7ZmlsbDojZTBlMGUwfS5zdDR7ZmlsbDpub25lO3N0cm9rZTojNjY2O3N0cm9rZS13aWR0aDouNTtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPgo8cGF0aCBkPSJtMjAuMjAyIDAuOTQ3NWMtMC43NDcwNyAwLTEuNTAzNCAwLjI5MDU2LTIuMTAxMiAwLjg5MDQ1bC0yLjI0MTIgMi4yNDk2LTEuNDk0Mi0xLjQ5OTctMi4xMDEyIDIuMTA4OSAzLjQ1NTIgMy40NjgxLTMuOTIyMSAzLjg4OTggMi4xMDEyIDIuMTA4OSAzLjg3NTQtMy45MzY3IDMuOTIyMSAzLjkzNjctMy45MjIxIDMuODg5OCAyLjEwMTIgMi4xMDg5IDMuODc1NC0zLjkzNjcgMy40NTUyIDMuNDY4MSAyLjEwMTItMi4xMDg5LTEuNDk0Mi0xLjQ5OTcgMi4yNDEyLTIuMjQ5NmMxLjE5NTQtMS4xOTk3IDEuMTk1NC0yLjk3MTIgMC00LjE3MTFsLTIuODQ4Mi0yLjg1ODggMy43MzU0LTMuNzQ5Mi0yLjEwMTItMi4xMDg5LTMuNzM1NCAzLjc0OTItMi44NDgyLTIuODU4OGMtMC41OTc2NS0wLjU5OTg4LTEuMzA3NC0wLjg5MDQ1LTIuMDU0NC0wLjg5MDQ1em0tMTUuNTQ5IDExLjM4OC0yLjEwMTIgMi4xMDg5IDEuNDk0MiAxLjQ5OTctMi4xMDEyIDIuMTA4OWMtMS4xOTUzIDEuMTk5Ny0xLjE5NTMgMi45NzEyIDAgNC4xNzExbDIuODQ4MiAyLjg1ODgtMy43MzU0IDMuNzQ5MiAyLjEwMTIgMi4xMDg5IDMuNzM1NC0zLjc0OTIgMi44NDgyIDIuODU4OGMxLjE5NTQgMS4xOTk3IDIuOTYwMiAxLjE5OTcgNC4xNTU2IDBsMi4xMDEyLTIuMTA4OSAxLjQ5NDIgMS40OTk3IDIuMTAxMi0yLjEwODl6IiBmaWxsPSIjZmZiNDE0IiBzdHJva2U9IiM5MTYzMDAiIHN0cm9rZS13aWR0aD0iMS40OTY5IiBzdHlsZT0idGV4dC1pbmRlbnQ6MDt0ZXh0LXRyYW5zZm9ybTpub25lIi8+Cjwvc3ZnPgo=';

const ftduinoConnectedIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CjxtZXRhZGF0YT4KPHJkZjpSREY+CjxjYzpXb3JrIHJkZjphYm91dD0iIj4KPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CjxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz4KPGRjOnRpdGxlLz4KPC9jYzpXb3JrPgo8L3JkZjpSREY+CjwvbWV0YWRhdGE+CjxzdHlsZT4uc3Qye2ZpbGw6cmVkfS5zdDN7ZmlsbDojZTBlMGUwfS5zdDR7ZmlsbDpub25lO3N0cm9rZTojNjY2O3N0cm9rZS13aWR0aDouNTtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPgo8cGF0aCBkPSJtMjguODQyIDEuMDU2Ny01LjIzMDIgNS4yMzAyLTIuODQ4Ni0yLjg0ODZjLTEuMTk1NS0xLjE5NTUtMi45NjA3LTEuMTk1NS00LjE1NjEgMGwtMy43MzU4IDMuNzM1OC0xLjQ5NDMtMS40OTQzLTIuMTAxNCAyLjEwMTQgMTQuOTQzIDE0Ljk0MyAyLjEwMTQtMi4xMDE0LTEuNDk0My0xLjQ5NDMgMy43MzU4LTMuNzM1OGMxLjE5NTUtMS4xOTU1IDEuMTk1NS0yLjk2MDYgMC00LjE1NjFsLTIuODQ4Ni0yLjg0ODYgNS4yMzAyLTUuMjMwMnptLTIxLjIwMSA4LjM1ODktMi4xMDE0IDIuMTAxNCAxLjQ5NDMgMS40OTQzLTMuNTk1NyAzLjU5NTdjLTEuMTk1NSAxLjE5NTUtMS4xOTU1IDIuOTYwNyAwIDQuMTU2MWwyLjg0ODYgMi44NDg2LTUuMjMwMiA1LjIzMDIgMi4xMDE0IDIuMTAxNCA1LjIzMDItNS4yMzAyIDIuODQ4NiAyLjg0ODZjMS4xOTU1IDEuMTk1NSAyLjk2MDcgMS4xOTU1IDQuMTU2MSAwbDMuNTk1Ny0zLjU5NTcgMS40OTQzIDEuNDk0MyAyLjEwMTQtMi4xMDE0eiIgZmlsbD0iIzFhZmYxNCIgb3ZlcmZsb3c9InZpc2libGUiIHN0cm9rZT0iIzAyOTEwMCIgc3Ryb2tlLXdpZHRoPSIxLjQ5NDMiIHN0eWxlPSJ0ZXh0LWluZGVudDowO3RleHQtdHJhbnNmb3JtOm5vbmUiLz4KPC9zdmc+Cg==';

const ftduinoNoWebUSBIcon = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CjxtZXRhZGF0YT4KPHJkZjpSREY+CjxjYzpXb3JrIHJkZjphYm91dD0iIj4KPGRjOmZvcm1hdD5pbWFnZS9zdmcreG1sPC9kYzpmb3JtYXQ+CjxkYzp0eXBlIHJkZjpyZXNvdXJjZT0iaHR0cDovL3B1cmwub3JnL2RjL2RjbWl0eXBlL1N0aWxsSW1hZ2UiLz4KPGRjOnRpdGxlLz4KPC9jYzpXb3JrPgo8L3JkZjpSREY+CjwvbWV0YWRhdGE+CjxzdHlsZT4uc3Qye2ZpbGw6cmVkfS5zdDN7ZmlsbDojZTBlMGUwfS5zdDR7ZmlsbDpub25lO3N0cm9rZTojNjY2O3N0cm9rZS13aWR0aDouNTtzdHJva2UtbWl0ZXJsaW1pdDoxMH08L3N0eWxlPgo8cGF0aCBkPSJtMjQuOTg3IDEuMjMwMi05LjA4MTggOS4yMDU5LTkuMDIyOC05LjE5ODItNS41NTg0IDUuNDgwOCA5LjA5OSA5LjI3NDYtOS4xNTggOS4yODIyIDUuNTQ1IDUuNDk2IDkuMDc5OS05LjIwNTkgOS4wODk1IDkuMjY1IDUuNTU4NC01LjQ4MDgtOS4xNjM3LTkuMzQxNCA5LjE1NjEtOS4yODIyeiIgY29sb3I9IiMwMDAwMDAiIGNvbG9yLXJlbmRlcmluZz0iYXV0byIgZG9taW5hbnQtYmFzZWxpbmU9ImF1dG8iIGZpbGw9IiNmZjE0MTQiIGZpbGwtcnVsZT0iZXZlbm9kZCIgaW1hZ2UtcmVuZGVyaW5nPSJhdXRvIiBzaGFwZS1yZW5kZXJpbmc9ImF1dG8iIHNvbGlkLWNvbG9yPSIjMDAwMDAwIiBzdHJva2U9IiM3MDAwMDAiIHN0cm9rZS13aWR0aD0iMS40NjM4IiBzdHlsZT0iZm9udC1mZWF0dXJlLXNldHRpbmdzOm5vcm1hbDtmb250LXZhcmlhbnQtYWx0ZXJuYXRlczpub3JtYWw7Zm9udC12YXJpYW50LWNhcHM6bm9ybWFsO2ZvbnQtdmFyaWFudC1saWdhdHVyZXM6bm9ybWFsO2ZvbnQtdmFyaWFudC1udW1lcmljOm5vcm1hbDtmb250LXZhcmlhbnQtcG9zaXRpb246bm9ybWFsO2lzb2xhdGlvbjphdXRvO21peC1ibGVuZC1tb2RlOm5vcm1hbDtzaGFwZS1wYWRkaW5nOjA7dGV4dC1kZWNvcmF0aW9uLWNvbG9yOiMwMDAwMDA7dGV4dC1kZWNvcmF0aW9uLWxpbmU6bm9uZTt0ZXh0LWRlY29yYXRpb24tc3R5bGU6c29saWQ7dGV4dC1pbmRlbnQ6MDt0ZXh0LW9yaWVudGF0aW9uOm1peGVkO3RleHQtdHJhbnNmb3JtOm5vbmU7d2hpdGUtc3BhY2U6bm9ybWFsIi8+Cjwvc3ZnPgo=';

/**
 * Class for the ftDuino blocks in Scratch 3.0
 * @constructor
 */

const STATE = { NOWEBUSB:0, DISCONNECTED:1, CONNECTED:2 };

const FTDUINO_BUTTON_ID = "ftDuino_connect_button";
const PARENT_CLASS = "controls_controls-container_2xinB"
const EXTENSION_ID = 'ftduino';

class Scratch3FtduinoBlocks {
    onConnectClicked() {
	this.manualConnect();
    }
    
    onDisconnectClicked() {
	this.port.disconnect();
	this.port = null;
	this.setButton(STATE.DISCONNECTED);
    }
    
    onNoWebUSBClicked() {
	alert("No ftDuino available:\n\n" + this.error_msg);
    }
	
    removeConnectButton() {
	button = document.getElementById(FTDUINO_BUTTON_ID);
	if(button != undefined)
	    button.parentNode.removeChild(button);
    }

    setButton(state, msg=null) {
	button = document.getElementById(FTDUINO_BUTTON_ID);
	if(button != undefined) {
	    if(state == STATE.NOWEBUSB) {
		this.error_msg = msg
		icon = ftduinoNoWebUSBIcon;
		title = "No WebUSB support available";
		handler = this.onNoWebUSBClicked.bind(this);
	    }	    
	    if(state == STATE.DISCONNECTED) {
		this.error_msg = ""
		icon = ftduinoDisconnectedIcon;
		title = "ftDuino not connected. Click icon to connect.";
		handler = this.onConnectClicked.bind(this);
	    }	    
	    if(state == STATE.CONNECTED) {
		this.error_msg = ""
		icon = ftduinoConnectedIcon;
		title = "ftDuino connected. Click icon to disconnect.";
		handler = this.onDisconnectClicked.bind(this);
	    }

	    // set button parameters
	    button.src = icon;
	    button.title = title;
	    button.onclick = handler;
	}
    }
    
    addButton() {
	//  check if the button already exists
	button = document.getElementById(FTDUINO_BUTTON_ID);

	if(button == undefined) {
	    console.log("ftDuino: Adding connect button");
	
	    x = document.getElementsByClassName(PARENT_CLASS);
	    if(x.length > 0) {
		hdrdiv = x[0];
	    
		img = document.createElement("IMG");
		img.classList.add("green-flag_green-flag_1kiAo");
		img.setAttribute("draggable", false);
		img.setAttribute("id", FTDUINO_BUTTON_ID);
		img.setAttribute("src", ftduinoNoWebUSBIcon);
		
		hdrdiv.appendChild(img);
	    } else
		alert("ftDuino: controls-container class not found!");
	}
    }
    
    constructor (runtime) {
	this.debug = false;
	this.port == null;
	state = STATE.NOWEBUSB;

	// place icon
	this.addButton(STATE.NOWEBUSB);

	if(navigator.usb) {
	    this.textEncoder = new TextEncoder();   
	    console.log("WebUSB supported!");
	    navigator.usb.addEventListener('connect', event => {
		this.autoConnect();
	    });
	    
	    navigator.usb.addEventListener('disconnect', event => {
		this.port.disconnect();
		this.port = null;
		this.setButton(STATE.DISCONNECTED);
	    });

	    // try to autoconnect first
	    this.autoConnect();

	} else
	    this.setButton(STATE.NOWEBUSB, "No USB support on this browser. "+
			   "Please use Google Chrome or a related browser.");

        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;


	this.runtime.registerPeripheralExtension(EXTENSION_ID, this);

//        this.disconnect = this.disconnect.bind(this);
//        this._onConnect = this._onConnect.bind(this);
//        this._onMessage = this._onMessage.bind(this);
//        this._pollValues = this._pollValues.bind(this);
    }

    manualConnect() {
	serial.requestPort().then(selectedPort => {
            console.log("ftDuino: User selected:" + selectedPort);
            this.connect(selectedPort);
	}).catch(error => {
	    // don't bug user if he selected "cancel"
	    if((error instanceof DOMException) && (error.code == DOMException.NOT_FOUND_ERR))
		return;		
	    
            alert('Connection error: ' + error);
	});
    }

    // commands sent to ftDuino
    ftdSet(item) { this.ftdReq(JSON.stringify({ set: item })); };
    
    ftdSetLed(state)            { this.ftdSet({ port: "led", value: state }); }
    ftdSetOutput(port,pwm)      { this.ftdSet({ port: port, mode: "HI", value: pwm }); }
   
    ftdReq(req) {
	if (this.port != null) {
            if(this.debug) console.log("TX:" + req);
            p = this.port.send(this.textEncoder.encode(req));
            p.then(
		function(val) {
		    if(this.debug)
			console.log("PROMISE fulfilled: "+ val.bytesWritten + " " + val.status);
		}
            );
	}
    }

    ftdGet(item = null, callback = null) {
	if(this.port == null) return;
	
	if(item) {
            this.callback = callback;
            this.get_item = item;
	}

	this.ftdReq(JSON.stringify({ get: this.get_item }));

	// schedule retransmission
	this.reply_timeout = setTimeout(this.ftdGet.bind(this), 1000);
    }

    ftdPollerCallback(v) {
	// this happens if the user clicked "disconnect"
	// we then just stop polling
	if(this.port == null) 
	    return;
	
	this.poll_state_input[this.poll_count] = Cast.toBoolean(v);

	// handle next input
	this.poll_count = this.poll_count + 1
	
	// next poller run in 2ms
	setTimeout(this.ftdPoller.bind(this), 2);
    }
	
    ftdPoller() {
	// poll count runs from 0 to 16. These mean
	// 0..7 = read inputs i1-i8
	// 8..15 = update outputs o1-o8 (if needed)
	// 16 = update led if needed

	while(this.poll_count > 7) {
	    if(this.poll_count <= 15) {
		// check for pending output updates
		this.poll_count++;

		// check for pending led update, counter is
		// now 9..16
		if(this.poll_update_output[this.poll_count-9]) {
		    port = "O"+(this.poll_count-8).toString();
		    // send new state
		    this.ftdSetOutput(port, this.poll_state_output[this.poll_count-9]);
		    // clear update flag
		    this.poll_update_output[this.poll_count-9] = false;

		    // next poller run in 10ms
		    setTimeout(this.ftdPoller.bind(this), 10);
		    
		    return;
		}
	    } else {
		// next handle input i1
		this.poll_count = 0;
		
		// check for pending led update
		if(this.poll_update_led) {
		    
		    // send new state
		    this.ftdSetLed(this.poll_state_led);
		    // clear update flag
		    this.poll_update_led = false;

		    // next poller run in 10ms
		    setTimeout(this.ftdPoller.bind(this), 10);
		    
		    return;
		}
	    }
	}
	    
	if((this.poll_count >= 0) && (this.poll_count <= 7)) {	
	    port = "I"+(this.poll_count+1).toString();
	    this.ftdGet({ port: port },
			{ "func": this.ftdPollerCallback.bind(this),
			  "value": "value",
			  "expect": { "port": port } });
	}
	
	
	// TODO: start another timout so we can deal with the
	// fact that a request or reply may get lost
    }
    
    ftdCheckVersionCallback(ver) {
	// enable run button after successful connection
	console.log("ftDuino setup completed");

	// make button indicate that we are now connected
	this.setButton(STATE.CONNECTED);

	// use a timer to frequently poll the inputs and
	// update the outputs
	this.poll_state_input  = [ false,false,false,false,false,false,false,false ];
	this.poll_state_output = [ false,false,false,false,false,false,false,false ];
	this.poll_state_led = false;

	// keep state of those outputs that need to be updated
	this.poll_update_output = [ false,false,false,false,false,false,false,false ];
	this.poll_update_led = false;

	// counter running over all inputs and outputs
	this.poll_count = 0;

	// start polling in 100ms
	setTimeout(this.ftdPoller.bind(this), 100);
    }

    ftdCheckVersion() {
	console.log("Checking for version");
	
	// send ESC (for parser reset)
	this.port.send(this.textEncoder.encode("\x1b"));
	this.ftdGet("version", { "value": "version",
				 "func": this.ftdCheckVersionCallback.bind(this) } );
    }

    parse(msg) {
	// run result through json decoder
	result = JSON.parse(msg);

	// if there's a pending callback
	if(this.callback) {
	    var reply_ok = true;
    
	    // check if all expected entries are in this reply (e.g. correct port)
	    if(this.callback["expect"]) {
		// iterate over all expected keys
		var keys = Object.keys(this.callback["expect"]);
		for(var i=0; i < keys.length ; i++) {
		    if(result[keys[i]].toLowerCase() !==
		       this.callback["expect"][keys[i]].toLowerCase()) {
			console.log("Missing expected reply parameter:",
				    keys[i], ":", this.callback["expect"][keys[i]], "-",msg);
			reply_ok = false;
		    }
		}
	    }
	    
	    if(result[this.callback["value"]] === undefined) {
		console.log("Missing value parameter: ", this.callback["value"]);
		reply_ok = false;
	    }
	    
	    if(reply_ok) {
		if(this.debug) console.log("Reply ok, cancelling timeout");
		
		// call it callback ...
		this.callback["func"](result[this.callback["value"]]);
		// ... and forget about it
		this.callback = null;
		
		// cancel any pending timeout
		clearTimeout(this.reply_timeout);
		this.reply_timeout = null;
	    }
	}
    }

    clean_buffer() {
	// buffer must begin with "{". Skip everything else
	while((this.buffer.length > 0) && (this.buffer.charAt(0) != '{'))
	    this.buffer = this.buffer.substr(1);
    }

    buffer_contains_message() {
	// check if there's a matching closing brace in buffer
	if(this.buffer.length < 2)
	    return 0;

	depth = 0;
	index = 0;
	while(index < this.buffer.length) {
	    // just increase the depth if another opening brace is found
	    if(this.buffer.charAt(index) == '{')
		depth++;
			
	    if(this.buffer.charAt(index) == '}') {
		// returning to level 0 means end of message
		depth--;
		if(depth == 0)
		    return index;
	    }
	    index++;
	}
	return 0;
    }
    
    connect(port) {   
	port.connect().then(() => {
	    this.buffer = "";
	    this.port = port;
            console.log('Connected to ' + port.device_.productName);

            // check version. A correct result will enable the GUI
            this.ftdCheckVersion();
	    
            port.onReceive = data => {
		let textDecoder = new TextDecoder();
		// append all data received to buffer
		// console.log("parse:", textDecoder.decode(data));
		this.buffer = this.buffer + textDecoder.decode(data);

		// console.log("Buffer: " + this.buffer);

		this.clean_buffer();
		index = this.buffer_contains_message();
		while(index > 0) {		
		    // extract the string and parse it
		    this.parse(this.buffer.substr(0, index+1));
		    
		    // and keep the rest in the buffer
		    this.buffer = this.buffer.substr(index+1);

		    // check if there's another message
		    this.clean_buffer();
		    index = this.buffer_contains_message();
		}
            }
            port.onReceiveError = error => {
		console.log('Receive error: ' + error);
            };
	}, error => {
            alert('Connection error: ' + error);
	});
    }
    
    autoConnect() {
	console.log("trying autoConnect ...");
	try {
            serial.getPorts().then(ports => {
		console.log("Ports" + ports);
		
		if (ports.length == 0) {
		    console.log("ftDuino: No paired device found!");
		    this.setButton(STATE.DISCONNECTED);
		} else {
		    // at least one device found. Connect to first one
		    this.connect(ports[0]);
		}
            } ); 
	} catch (e) {
            alert("WebUSB not available: " + e);
	    this.setButton(STATE.NOWEBUSB, e);
	}
    }

    connect () { console.log("connect"); } 
    disconnect () { console.log("disconnect"); } 

    scan_done() {
	// scratch-gui/src/lib/libraries/extensions/index.jsx
	// scratch-gui/src/components/connection-modal/scanning-step.jsx
	// scratch-vm/src/io/bt.js
	params = {}
	params.peripheralId = "ftDuino #1";
	params.name = "ftDuino #1";
	params.rssi = 12;
	
	this.devices = { };
	this.devices[params.peripheralId] = params;
	
	console.log("add");
	this.runtime.emit(
            this.runtime.constructor.PERIPHERAL_LIST_UPDATE, this.devices);

	// alternally emit error
	// this.runtime.emit(this.runtime.constructor.PERIPHERAL_REQUEST_ERROR, {
	//            message: `Scratch lost connection to`,
	//            extensionId: EXTENSION_ID
	//        });
	
	// this.runtime.emit(this.runtime.constructor.PERIPHERAL_SCAN_TIMEOUT);
    }
    
    // how to report the result?
    scan () {
	console.log("SCAN!!!");

	// schedule retransmission
	setTimeout(this.scan_done.bind(this), 1000);
	
    }
    
    isConnected () {
	console.log("isconnected");
	return false;
    }
	
    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: EXTENSION_ID,
            name: 'ftDuino',
            blockIconURI: blockIconURI,
            connectionIconURL: blockIconURI,  // should be different ...
	    showStatusButton: true,
	    docsURI: 'http://ftduino.de',
            blocks: [
		{
		    opcode: 'led',
		    text: formatMessage({
                        id: 'ftduino.led',
                        default: 'set LED [VALUE]',
                        description: 'set the ftDuino led'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
			VALUE: {
                            type: ArgumentType.STRING,
                            menu: 'ONOFFSTATE',
                            defaultValue: 'On'
                        }
                    }
		},
		{
		    opcode: 'input',
		    text: formatMessage({
                        id: 'ftduino.input',
                        default: 'input [INPUT]',
                        description: 'read an ftDuino input'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        INPUT: {
                            type: ArgumentType.STRING,
                            menu: 'INPUT',
                            defaultValue: 'I1'
                        }
                    }
		},
		{
		    opcode: 'output',
		    text: formatMessage({
                        id: 'ftduino.output',
                        default: 'set output [OUTPUT] to [VALUE]',
                        description: 'set an ftDuino output'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        OUTPUT: {
                            type: ArgumentType.STRING,
                            menu: 'OUTPUT',
                            defaultValue: 'O1'
                        },
			VALUE: {
                            type: ArgumentType.STRING,
                            menu: 'ONOFFSTATE',
                            defaultValue: 'On'
                        }
                    }
		}
            ],
            menus: {
                ONOFFSTATE: [
		    { text: formatMessage({id: 'ftduino.on', default: 'On' }), value: '1'},
		    { text: formatMessage({id: 'ftduino.off',default: 'Off'}), value: '0' }
		],
                INPUT: [
		    {text: 'I1', value: 'i1'}, {text: 'I2', value: 'i2'},
		    {text: 'I3', value: 'i3'}, {text: 'I4', value: 'i4'},
		    {text: 'I5', value: 'i5'}, {text: 'I6', value: 'i6'},
		    {text: 'I7', value: 'i7'}, {text: 'I8', value: 'i8'}
                ],
                OUTPUT: [
		    {text: 'O1', value: 'o1'}, {text: 'O2', value: 'o2'},
		    {text: 'O3', value: 'o3'}, {text: 'O4', value: 'o4'},
		    {text: 'O5', value: 'o5'}, {text: 'O6', value: 'o6'},
		    {text: 'O7', value: 'o7'}, {text: 'O8', value: 'o8'}
                ]
            },
            translation_map: {
		en: {
		    'extensionName': 'ftDuino (en)',
                    'input': 'input [INPUT]',
                    'ftduino.input': 'input [INPUT]',
		},
		de: {
		    'extensionName': 'ftDuino (de)',
                    'input': 'Eingang [INPUT]',
                    'ftduino.input': 'Eingang [INPUT]',
		}
	    }		
        };
    }
    
    led (args) {
	// check if ftDuino is connected at all
	if(this.port == null) return;
	
	new_state = Cast.toBoolean(args.VALUE);
	if(new_state != this.poll_state_led) {
	    this.poll_state_led = new_state;
	    this.poll_update_led = true;      // led needs update 
	}
    }
	
    input (args) {
	// check if ftDuino is connected at all
	if(this.port == null) return false;
	
	port = Cast.toNumber(args.INPUT.substr(1))-1;
	return this.poll_state_input[port];
    }
	
    output (args) {
	// check if ftDuino is connected at all
	if(this.port == null) return;

	port = Cast.toNumber(args.OUTPUT.substr(1))-1;
	new_state = Cast.toBoolean(args.VALUE);
	if(new_state != this.poll_state_output[port]) {
	    this.poll_state_output[port] = new_state;
	    this.poll_update_output[port] = true;      // output needs update 
	}
    }

}
module.exports = Scratch3FtduinoBlocks;
