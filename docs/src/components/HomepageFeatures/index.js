import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';
import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';

const FeatureList = [
  {
    title: 'Ethereum Social Graph',
    subTitle: 'Persistency | Composability',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    imgSrc: '/img/tardigrade-ethereum.png',
    description: (
      <>
        Tardigrade puts the most rudimentary of social graphs on a blockchain to help keep a users network persistent across platforms and to enable composability with cryptographic primitives.  It is the aspiration to explore zero knowledge circuits in the creation of privacy centric social graphs. 
      </>
    ),
  },
  {
    title: 'IPFS Pubsub EIP-712 Micropayments',
    subTitle: 'Gasless micropayments for many, one incentived gasful tx.',
    imgSrc: '/img/tardigrade-network.png',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Tardigrade uses token timelocks and IPFS pubsub EIP-712 message chaining to enable gassless micropayments to be chained together for another user to consume before the deadline expires.
      </>
    ),
  },
  {
    title: 'Defi Metagames',
    subTitle: 'Composability | Competition | Journey to Undercollateralization',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    imgSrc: '/img/tardigrade-modular.png',
    description: (
      <>Together Combined, they expose an ability to temporarily and pragmatically break the security and speed portion of the blockchain security trilemma. It enables web3 equivalents of things like tip jars, honour boxes, and hopefully one day Collateralization rates under 100%.</>    ),
  },
];

function Feature({Svg, imgSrc, title, subTitle, description}) {
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
        <h4>{subTitle}</h4>
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
