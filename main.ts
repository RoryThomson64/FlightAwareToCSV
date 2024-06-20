import { readFileSync, writeFileSync, openSync } from "fs";
const path = "./trackpoll.rvt.json";
const json = JSON.parse(readFileSync(path, "utf8"));
const flights = json.flights;

interface trackPoint {
  timestamp: number;
  coord: [number, number];
  gs: number;
  alt: number;
  type: string;
  isolated: boolean;
}
interface point {
  type: string;

  time: number;
}
interface altPoint extends point {
  type: "alt";
  alt: number;
}
interface gsPoint extends point {
  type: "gs";
  gs: number;
}
interface coord extends point {
  type: "coord";
  coord: [number, number];
}
interface points {
  altPoints: altPoint[];
  gsPoints: gsPoint[];
  coords: coord[];
}
Object.values(flights).forEach((flight: any, flightIndex: number) => {
  const track = flight.track as trackPoint[];
  const processed_track = track.reduce(
    (acc: points, curr) => {
      const time = curr.timestamp;
      acc.altPoints.push({ alt: curr.alt, time: time, type: "alt" });
      acc.gsPoints.push({ gs: curr.gs, time: time, type: "gs" });
      acc.coords.push({ coord: curr.coord, time: time, type: "coord" });
      return acc;
    },
    { altPoints: [], gsPoints: [], coords: [] } as points
  );
  //   function convertTZ(date, tzString: string): Date {
  //     return new Date(
  //       (typeof date === "string" ? new Date(date) : date).toISOString("en-US", {
  //         timeZone:
  //           tzString[0] !== ":"
  //             ? tzString
  //             : tzString.substring(1, tzString.length),
  //       })
  //     );
  //   }
  type pointTypes = gsPoint[] | altPoint[] | coord[];
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    minute: "numeric",
    timeZoneName: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone:
      flight.origin.TZ[0] === ":"
        ? flight.origin.TZ.substring(1, flight.origin.TZ.length)
        : flight.origin.TZ,
  });
  Object.entries(processed_track).forEach((entry: [string, pointTypes]) => {
    const fileName = "./" + entry[0] + "_" + flightIndex + ".csv";
    const file = openSync(fileName, "w");

    entry[1].forEach((point) => {
      //   let str = convertTZ(new Date(point.time * 1000), flight.origin.TZ) + ",";
      let str =
        dateFormatter.format(new Date(point.time * 1000)).replace(",", "") +
        ",";

      switch (point.type) {
        case "alt":
          str += point.alt + "\n";
          break;
        case "gs":
          str += point.gs + "\n";
          break;
        case "coord":
          str += point.coord[0] + "," + point.coord[1] + "\n";
      }
      writeFileSync(file, str);
    });
  });

  //   console.log(processed_track);
});
// console.log(json.flights.track);
// console.log(path);
