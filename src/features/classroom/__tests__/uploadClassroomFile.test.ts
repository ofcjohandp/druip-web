describe('uploadClassroomFile', () => {
  it.todo('CARD-02: converts file URI to Blob via fetch before uploading');
  it.todo('CARD-02: uploads to classroom-assets bucket with classroomId/timestamp path');
  it.todo('CARD-02: returns storage path string on success');
  it.todo('CARD-02: throws on upload error');
});

describe('getSignedUrl', () => {
  it.todo('CARD-02: calls createSignedUrl with 3600s expiry');
  it.todo('CARD-02: returns signed URL string');
  it.todo('CARD-02: throws on error');
});
