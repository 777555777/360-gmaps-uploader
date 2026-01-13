/**
 * MapTiler Geocoding API Types
 * Based on: https://docs.maptiler.com/cloud/api/geocoding/
 */

export interface GeocodingFeature {
	id: string;
	type: 'Feature';
	place_type: string[];
	relevance: number;
	address?: string;
	text: string;
	place_name: string;
	matching_text?: string;
	matching_place_name?: string;
	language?: string;
	bbox?: [number, number, number, number]; // [west, south, east, north]
	center: [number, number]; // [longitude, latitude]
	geometry: {
		type: 'Point';
		coordinates: [number, number]; // [longitude, latitude]
	};
	properties: {
		ref?: string;
		country_code?: string;
		kind?: string;
		categories?: string[];
		feature_tags?: Record<string, string>;
		place_designation?: string;
	};
	context?: Array<{
		id: string;
		text: string;
		language?: string;
	}>;
}

export interface GeocodingResponse {
	type: 'FeatureCollection';
	features: GeocodingFeature[];
	query: string[];
	attribution: string;
}
