import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Persistency | Composability',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Tardigrade puts a social graph on a blockchain to help keep a users network persistent across platforms and to enable composability with cryptographic primitives.
      </>
    ),
  },
  {
    title: 'Horizontal Integration | Competition',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Data, Algorithms, Moderation, Platforms.  What was take all or nothing is now layerable, swappable, injectable and exposed to free market principles
      </>
    ),
  },
  {
    title: 'Powered Ethereum & IPFS',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Tardigrade uses token timelocks and IPFS pubsub EIP-712 message chaining to enable low security, but handy metagames like tipjar and honourbox
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
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
