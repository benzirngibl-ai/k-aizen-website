// KatalogBook.jsx — Top-Level Component für die Katalog-Seite.
// Bundelt BookFlipper + alle Seiten.

import React from 'react';
import BookFlipper from './BookFlipper.jsx';
import {
  CoverBlank,
  CoverTitle,
  VorwortLeft,
  UebersichtRight,
  PaHeroLeft,
  PaPriceRight,
  ClosingLeft,
  CtaRight,
} from './pages.jsx';

export default function KatalogBook() {
  const pages = [
    <CoverBlank key="p0" />,
    <CoverTitle key="p1" />,
    <VorwortLeft key="p2" />,
    <UebersichtRight key="p3" />,
    <PaHeroLeft key="p4" />,
    <PaPriceRight key="p5" />,
    <ClosingLeft key="p6" />,
    <CtaRight key="p7" />,
  ];

  return <BookFlipper pages={pages} />;
}
