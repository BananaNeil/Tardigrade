import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';

const FeatureList = [
  {
    title: 'Persistency | Composability',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    imgSrc: '/img/tardigrade-network.png',
    description: (
      <>
        Tardigrade puts a social graph on a blockchain to help keep a users network persistent across platforms and to enable composability with cryptographic primitives.
      </>
    ),
  },
  {
    title: 'Horizontal Integration | Competition',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    imgSrc: '/img/tardigrade-modular.png',
    description: (
      <>
        Data, Algorithms, Moderation, Platforms.  What was take all or nothing is now layerable, swappable, injectable and exposed to free market principles
      </>
    ),
  },
  {
    title: 'Token Agnostic & IPFS',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    imgSrc: '/img/tardigrade-ethereum.png',
    description: (
      <>
        Tardigrade uses token timelocks and IPFS pubsub EIP-712 message chaining to enable low security, but handy metagames like tipjar and honourbox
      </>
    ),
  },
];

function Feature({Svg, imgSrc, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <ThemedImage className={styles.featureSvg} sources={{
          light: useBaseUrl(imgSrc),
          dark: useBaseUrl(imgSrc)
        }}/>
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
