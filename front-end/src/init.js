import GoogleAnalytics from 'react-ga';

export default function initGA() {
    const hostname = window && window.location && window.location.hostname;
    if (hostname === 'npm-miner.com') {
        GoogleAnalytics.initialize('UA-2782275-15')
    }
}