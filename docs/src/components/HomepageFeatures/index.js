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
        Tardigrade puts a social graph on a blockchain to help keep a users network persistent across platforms and to enable composability with cryptographic primitives.
      </>
    ),
  },
  {
    title: 'IPFS Pubsub EIP-712 Micropayments',
    subTitle: 'Gasless micropayments for many, one incentived gasful tx.',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    imgSrc: '/img/tardigrade-modular.png',
    description: (
      <>
        Tardigrade uses token timelocks and IPFS pubsub EIP-712 message chaining to enable gassless micropayments to be chained together for another user to consumer before the deadline expires.
      </>
    ),
  },
  {
    title: 'Defi Metagames',
    subTitle: 'Composability | Competition | Journey to Undercollateralization',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    imgSrc: '/img/tardigrade-network.png',
    description: (
      <>Together Combined exposes an ability to temporarily and pragmatically break the security and speed portion of the blockchain security trilemma. It enables web3 equivalents of things like tip jars, honour boxes, and hopefully one day Collateralization rates under 100%.</>    ),
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
