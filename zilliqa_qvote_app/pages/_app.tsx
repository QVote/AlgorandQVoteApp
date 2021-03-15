import App from "next/app";
import Head from "next/head";
import { Grommet, grommet as grommetTheme } from "grommet";
import { deepMerge } from 'grommet/utils'
import { WithMetamask } from '../components/WithMetamask';

const desc = "QVote x Zilliqa";
const title = "QVoteZilliqa";
const twitterUrl = "https://qvote.co.uk";    // TODO why is this twitter? 

const customTheme = deepMerge(grommetTheme, {
    global: {
        focus: { border: { color: "accent-3" } },
        colors: {
            // Overriding existing colors
            brand: '#242424',
            "accent-1": "#24CC96",
            "accent-2": "#F9F6DC",
            "accent-3": "#C91D7B"
        },
    },
});


export default class MyApp extends App {
    componentDidMount() { }
    render() {
        //@ts-ignore
        const { Component, pageProps } = this.props;
        return (
            <>
                <Head>
                    <title>{title}</title>
                    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
                    <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
                    <meta name="msapplication-TileColor" content="#ffc40d" />
                    <meta name="theme-color" content="#ffffff" />
                    <link rel="manifest" href="/manifest.webmanifest" />
                    <link rel="shortcut icon" href="/favicon.ico" />
                    <meta name="msapplication-config" content="/browserconfig.xml" />
                    <meta name="msapplication-tap-highlight" content="no" />
                    <meta name="application-name" content={title} />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                    <meta name="apple-mobile-web-app-title" content={title} />
                    <meta name="description" content={desc} />
                    <meta name="format-detection" content="telephone=no" />
                    <meta name="mobile-web-app-capable" content="yes" />
                    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:url" content={twitterUrl} />
                    <meta name="twitter:title" content={title} />
                    <meta name="twitter:description" content={desc} />
                </Head>
                <Grommet theme={customTheme} full >
                    <WithMetamask>
                        <Component {...pageProps} />
                    </WithMetamask>
                </Grommet>
            </>
        );
    }
}
