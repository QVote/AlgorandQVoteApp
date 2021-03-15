import { Box, Text, Drop } from 'grommet';
import { useRef, useState } from 'react';

export const CopyOnly = ({ arr }:
    { arr: [string, string][] }) => {
    return (
        <Box gap="small">
            {
                arr.map(([head, toCopy]) => {
                    const concat = `${head}${toCopy}`;
                    return (
                        <CopyTarget key={`key${concat}`} {...{ head, toCopy }} />
                    )
                })
            }
        </Box >
    )
}

function CopyTarget({ head, toCopy }) {
    const targetRef = useRef();
    const [showDrop, setShowDrop] = useState(false);

    async function onCopy() {
        const x = document.createElement("INPUT");
        x.setAttribute("type", "text");
        x.setAttribute("value", toCopy);
        // @ts-ignore it works it is a txt input
        x.select()
        // @ts-ignore
        x.setSelectionRange(0, 99999);
        document.execCommand("copy");
        // @ts-ignore 
        navigator.clipboard.writeText(toCopy);
        setShowDrop(true);
        setTimeout(() => setShowDrop(false), 500);
    }

    return (
        <Box gap="small">
            <Text>{head}</Text>
            <Box
                pad="small"
                onClick={onCopy}
                ref={targetRef}
                style={{ overflow: "hidden" }}
                border={true}
            >
                <Text textAlign="center">{toCopy}</Text>
                {targetRef.current && showDrop && (
                    <Drop
                        plain
                        align={{ left: 'right', bottom: "top" }}
                        target={targetRef.current}
                    >
                        <Box
                            round="small"
                            align="center"
                        ><Text>Copied!</Text></Box>
                    </Drop>
                )}
            </Box>
        </Box>
    )
}