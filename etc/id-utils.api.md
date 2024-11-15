## API Report File for "@sanity/id-utils"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { Brand } from 'ts-brand';
import { Brander } from 'ts-brand';

// @public
export function createDraftId(input?: string): DraftId

// @public
export function createPublishedId(input?: string): PublishedId

// @public
export function createVersionId(
versionName: string,
input?: string,
): VersionId

// @public (undocumented)
export type DocumentId = DraftId | PublishedId | VersionId

// @public (undocumented)
export const DocumentId: Brander<DocumentId>;

// @public (undocumented)
export type DraftId = Brand<string, 'draftId'>

// @public (undocumented)
export const DraftId: Brander<DraftId>;

// @public
export function getDraftId(id: DocumentId): DraftId

// @public
export function getPublishedId(id: DocumentId): PublishedId

// @public
export function getVersionId(
id: DocumentId,
versionName: string,
): VersionId

// @public
export function getVersionNameFromId(id: VersionId): string

// @public
export function isDraftId(id: DocumentId): id is DraftId

// @public
export function isDraftOf(
id: DocumentId,
candidate: DocumentId,
): candidate is DraftId

// @public
export function isPublishedId(id: DocumentId): id is PublishedId

// @public
export function isPublishedIdEqual(
id: DocumentId,
otherId: DocumentId,
): boolean

// @public
export function isVersionId(id: DocumentId): id is VersionId

// @public
export function isVersionOf(
id: DocumentId,
candidate: DocumentId,
): candidate is VersionId

// @public (undocumented)
export type PublishedId = Brand<string, 'publishedId'>

// @public (undocumented)
export const PublishedId: Brander<PublishedId>;

// @public (undocumented)
export type VersionId = Brand<string, 'versionId'>

// @public (undocumented)
export const VersionId: Brander<VersionId>;

// (No @packageDocumentation comment for this package)

```
