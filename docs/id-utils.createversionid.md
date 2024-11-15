<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@sanity/id-utils](./id-utils.md) &gt; [createVersionId](./id-utils.createversionid.md)

## createVersionId() function

Create a new version id

**Signature:**

```typescript
export declare function createVersionId(
  versionName: string,
  input?: string,
): VersionId
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

versionName


</td><td>

string


</td><td>

The name of the version to create


</td></tr>
<tr><td>

input


</td><td>

string


</td><td>

_(Optional)_ Optional input string to create the id from. The input string will be converted to a string safe to use as a sanity document id, i.e. - stripped for any special characters - capped at max 100 chars If no input is provided, a random uuid will be used instead


</td></tr>
</tbody></table>
**Returns:**

[VersionId](./id-utils.versionid.md)

