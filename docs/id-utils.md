<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@sanity/id-utils](./id-utils.md)

## id-utils package

## Functions

<table><thead><tr><th>

Function


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[createDraftId(input)](./id-utils.createdraftid.md)


</td><td>

Create a new draft id


</td></tr>
<tr><td>

[createPublishedId(input)](./id-utils.createpublishedid.md)


</td><td>

Create a new document id


</td></tr>
<tr><td>

[createVersionId(versionName, input)](./id-utils.createversionid.md)


</td><td>

Create a new version id


</td></tr>
<tr><td>

[getDraftId(id)](./id-utils.getdraftid.md)


</td><td>

Returns the draft ID of the provided document ID


</td></tr>
<tr><td>

[getPublishedId(id)](./id-utils.getpublishedid.md)


</td><td>

Returns the published ID of the provided document ID


</td></tr>
<tr><td>

[getVersionId(id, versionName)](./id-utils.getversionid.md)


</td><td>

Returns a version ID of the provided document ID


</td></tr>
<tr><td>

[getVersionNameFromId(id)](./id-utils.getversionnamefromid.md)


</td><td>

Extracts and returns the version name of a version id e.g. getVersionNameFromId(VersionId(`versions.xyz.foo`<!-- -->)) = `xyz`


</td></tr>
<tr><td>

[isDraftId(id)](./id-utils.isdraftid.md)


</td><td>

Check whether a given document ID is a draft ID


</td></tr>
<tr><td>

[isDraftOf(id, candidate)](./id-utils.isdraftof.md)


</td><td>

Check whether a particular document ID is the draft ID of another document ID


</td></tr>
<tr><td>

[isPublishedId(id)](./id-utils.ispublishedid.md)


</td><td>

Check whether a given document ID is a published ID


</td></tr>
<tr><td>

[isPublishedIdEqual(id, otherId)](./id-utils.ispublishedidequal.md)


</td><td>

Checks if two document ids resolves to the same published ID, ignoring any draft or version prefix.


</td></tr>
<tr><td>

[isVersionId(id)](./id-utils.isversionid.md)


</td><td>

Check whether a given document ID is a version ID


</td></tr>
<tr><td>

[isVersionOf(id, candidate)](./id-utils.isversionof.md)


</td><td>

Check whether a particular document ID is a version ID of another document ID


</td></tr>
</tbody></table>

## Variables

<table><thead><tr><th>

Variable


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[DocumentId](./id-utils.documentid.md)


</td><td>



</td></tr>
<tr><td>

[DraftId](./id-utils.draftid.md)


</td><td>



</td></tr>
<tr><td>

[PublishedId](./id-utils.publishedid.md)


</td><td>



</td></tr>
<tr><td>

[VersionId](./id-utils.versionid.md)


</td><td>



</td></tr>
</tbody></table>

## Type Aliases

<table><thead><tr><th>

Type Alias


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[DocumentId](./id-utils.documentid.md)


</td><td>



</td></tr>
<tr><td>

[DraftId](./id-utils.draftid.md)


</td><td>



</td></tr>
<tr><td>

[PublishedId](./id-utils.publishedid.md)


</td><td>



</td></tr>
<tr><td>

[VersionId](./id-utils.versionid.md)


</td><td>



</td></tr>
</tbody></table>
