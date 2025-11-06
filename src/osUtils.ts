/**
 * Utilities for detecting operating system and its version
 */

import { Platform } from 'obsidian';

export interface OSInfo {
	os: string;
	osVersion: string;
}

/**
 * Detects the operating system using Obsidian Platform API
 * Note: OS version detection is not available through Platform API
 * @returns Object with OS and version information
 */
export function detectOS(): OSInfo {
	let os = 'Unknown';
	const osVersion = 'Unknown'; // Version detection not available through Platform API
	
	// Use Obsidian Platform API to detect OS
	if (Platform.isWin) {
		os = 'Windows';
	} else if (Platform.isMacOS) {
		os = 'macOS';
	} else if (Platform.isLinux) {
		os = 'Linux';
	} else if (Platform.isAndroidApp) {
		os = 'Android';
	} else if (Platform.isIosApp) {
		os = Platform.isPhone ? 'iOS (iPhone)' : 'iOS (iPad)';
	}
	
	return {
		os,
		osVersion,
	};
}

