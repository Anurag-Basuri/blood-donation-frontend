import { Globe } from 'react-globe.gl';

export default function InteractiveGlobe() {
	const [points, setPoints] = useState([]);

	useEffect(() => {
		// Fetch or generate points data
		const generatedPoints = generatePoints();
		setPoints(generatedPoints);
	}, []);

	return (
		<Globe
			globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
			pointsData={points}
			pointColor={() => '#ff0000'}
			pointRadius={0.5}
			pointAltitude={0.01}
			pointResolution={16}
		/>
	);
}
