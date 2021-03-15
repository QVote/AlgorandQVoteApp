import { Text, Button, Box } from 'grommet'
import { useRouter } from 'next/router'

export default function Index() {
    return (
        <Box gap="small" width={{ min: "medium" }} pad="medium" animation={[
            { type: "fadeIn", duration: 1000 },
            { type: "slideRight", duration: 1000 },
        ]}>

            <RouteButton label={"Create"} route={"/create"} align="start" />
            <RouteButton label={"Vote"} route={"/vote"} align="start" />
            <RouteButton label={"View Results"} route={"/results"} align="end" />
        </Box>
    )
}

function RouteButton({ label, route, align }:
    { label: string, route: string, align: string }) {
    const router = useRouter();

    function onRoute() {
        router.push(route);
    }

    return (
        <Box align={"start"}>
            <Button label={label} onClick={onRoute} />
        </Box>
    )
}
