<script lang="ts">
    import { decode } from "@googlemaps/polyline-codec";
    import L from "leaflet";
    import "leaflet/dist/leaflet.css";
    import { onDestroy, onMount, setContext } from "svelte";

    let map: L.Map | undefined;
    let polyline: L.Polyline | undefined;
    let startMarker: L.Marker | undefined;
    let endMarker: L.Marker | undefined;
    let mapElement: HTMLDivElement;

    export let bounds: L.LatLngBoundsExpression | undefined = undefined;
    export let view: number[] | undefined = undefined;
    export let encodedPolyline: string | undefined = undefined;
    export let zoom: number | undefined = undefined;

    let startIcon = L.divIcon({
        className: "map-marker",
        html: `<i class="fas fa-flag-checkered fa-2x"></i>`,
        iconAnchor: [0, 25],
        // iconSize: [50, 50],
    });

    let endIcon = L.divIcon({
        className: "map-marker-end",
        html: `<i class="fas fa-person-running fa-3x"></i>`,
        iconAnchor: [15, 15],
    });

    onMount(() => {
        if (!bounds && (!view || !zoom || !encodedPolyline)) {
            throw new Error(
                "You must provide either `bounds` or `view`,`zoom`, and `encodedPolyline`",
            );
        }
        map = L.map(mapElement);

        if (encodedPolyline) {
            const latLngs = decode(encodedPolyline);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
            }).addTo(map);
            polyline = L.polyline(latLngs, { color: "red" }).addTo(map);

            startMarker = L.marker(latLngs[0], { icon: startIcon }).addTo(map);
            endMarker = L.marker(latLngs[latLngs.length - 1], {
                icon: endIcon,
            }).addTo(map);
        }
    });

    onDestroy(() => {
        startMarker?.remove();
        startMarker = undefined;
        endMarker?.remove();
        endMarker = undefined;
        polyline?.remove();
        polyline = undefined;
        map?.remove();
        map = undefined;
    });

    // setContext("map", {
    //     getMap: () => map,
    // });

    $: if (map && polyline) {
        if (bounds) {
            map.fitBounds(bounds);
        } else if (view && zoom) {
            let latLngExpression: L.LatLngExpression = L.latLng(
                view[0],
                view[1],
            );
            map.setView(latLngExpression, zoom);
            map.fitBounds(polyline.getBounds());
        }
    }

    $: if (map && encodedPolyline) {
        startMarker?.remove();
        endMarker?.remove();
        polyline?.remove();

        let latLngs = decode(encodedPolyline);

        // Create the new polyline and markers
        polyline = L.polyline(latLngs, { color: "red" }).addTo(map);
        startMarker = L.marker(latLngs[0], { icon: startIcon }).addTo(map);
        endMarker = L.marker(latLngs[latLngs.length - 1], {
            icon: endIcon,
        }).addTo(map);

        // Fit the map to the bounds of the polyline
        map.fitBounds(polyline.getBounds());
    }
</script>

<div class="w-full h-full" bind:this={mapElement}>
    <slot />
</div>
