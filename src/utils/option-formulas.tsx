import cdf from '@stdlib/stats-base-dists-normal-cdf';
type SviParams = number[];
type SviProps = {
    strikePrice: number;
    forwardPrice: number;
    sviParams: SviParams;
}
type BSMProps = {
    spotPrice: number;
    strikePrice: number;
    timeToExpiry: number;
    riskFreeRate: number;
    impliedVolatility: number;
    isCall: boolean;
}
export function calculateMoneyness({ forwardPrice, strikePrice }: { forwardPrice: number; strikePrice: number }): number {
    return forwardPrice / strikePrice;
}

export function calculateLogMoneyness({ forwardPrice, strikePrice }: { forwardPrice: number; strikePrice: number }): number {
    return Math.log(forwardPrice / strikePrice);
}

export function rawSVIVol({strikePrice, forwardPrice, sviParams}: SviProps): number {
    const k = calculateLogMoneyness({ forwardPrice, strikePrice });
    const [a, b, rho, m, sigma] = sviParams;
    return a + b * (rho * (k - m) + Math.sqrt((k - m)**2 + sigma**2));
}

export function naturalSVIVol({strikePrice, forwardPrice, sviParams}: SviProps): number {
    const k = calculateLogMoneyness({ forwardPrice, strikePrice });
    const [delta, mu, rho, omega, zeta] = sviParams;
    return  delta + (omega/2) * (1 + (zeta*rho*(k - mu)) + Math.sqrt((zeta*(k-mu) + rho) ** 2 + (1 - rho**2)));
}

export function calculateBSMPrice({spotPrice, strikePrice, timeToExpiry, riskFreeRate, impliedVolatility, isCall}:  BSMProps): number {

    const sqrtT = Math.sqrt(timeToExpiry)
    const d1 = (Math.log(spotPrice/strikePrice) + (riskFreeRate + 0.5 * impliedVolatility**2) * timeToExpiry) / (impliedVolatility * sqrtT)
    const d2 = d1 - timeToExpiry * sqrtT;

    if (isCall) {
        return spotPrice * cdf(d1, 0, 1) - strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * cdf(d2, 0, 1);
    } else {
        return strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * cdf(-d2, 0, 1) - spotPrice * cdf(-d1, 0, 1);
    }
}