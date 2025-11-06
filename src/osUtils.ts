/**
 * Utilities for detecting operating system and its version
 */

export interface OSInfo {
	os: string;
	osVersion: string;
}

/**
 * Detects the operating system and its version based on navigator API
 * @returns Object with OS and version information
 */
export function detectOS(): OSInfo {
	// Check if navigator is available
	if (typeof navigator === 'undefined' || !navigator.platform) {
		return {
			os: 'Unknown',
			osVersion: 'Unknown',
		};
	}

	const platform = navigator.platform.toLowerCase();
	const ua = navigator.userAgent;
	let os = 'Unknown';
	let osVersion = 'Unknown';
	
	if (platform.includes('win')) {
		os = 'Windows';
		// Try to determine Windows version from userAgent
		const winVersionMatch = ua.match(/Windows NT (\d+\.\d+)/);
		if (winVersionMatch) {
			const version = winVersionMatch[1];
			const versionMap: Record<string, string> = {
				'10.0': '10/11',
				'6.3': '8.1',
				'6.2': '8',
				'6.1': '7',
			};
			osVersion = versionMap[version] || version;
		}
	} else if (platform.includes('mac')) {
		os = 'macOS';
		// Try to determine macOS version from userAgent
		const macVersionMatch = ua.match(/Mac OS X (\d+[._]\d+(?:[._]\d+)?)/);
		if (macVersionMatch) {
			osVersion = macVersionMatch[1].replace(/_/g, '.');
		}
	} else if (platform.includes('linux')) {
		os = 'Linux';
		osVersion = 'Unknown';
	} else if (platform.includes('android')) {
		os = 'Android';
		const androidVersionMatch = ua.match(/Android (\d+(?:\.\d+)?)/);
		if (androidVersionMatch) {
			osVersion = androidVersionMatch[1];
		}
	} else if (platform.includes('iphone') || platform.includes('ipad')) {
		os = platform.includes('iphone') ? 'iOS (iPhone)' : 'iOS (iPad)';
		const iosVersionMatch = ua.match(/OS (\d+[._]\d+(?:[._]\d+)?)/);
		if (iosVersionMatch) {
			osVersion = iosVersionMatch[1].replace(/_/g, '.');
		}
	}
	
	return {
		os,
		osVersion,
	};
}

