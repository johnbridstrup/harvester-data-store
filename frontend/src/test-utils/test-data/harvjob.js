export const job = {
  id: 1,
  created: "2022-10-21T23:35:49.687000Z",
  lastModified: "2022-10-21T23:43:16.630000Z",
  payload: {
    targets: ["master", "robot01"],
    id: "183a3ab2-5199-11ed-8eb4-7b94730d4c5d",
    job_type: "test",
    timeout: 6000,
  },
  jobstatus: "Success",
  creator: 1,
  modifiedBy: null,
  event: 7,
  schema: 1,
  target: 4,
  results:
    "/api/v1/jobresults/?job__target__harv_id=1&job__event__UUID=431afec6-3898-11ed-b748-78d00429ea3e",
  history: "/api/v1/harvjobs/1/history/",
};

export const jobdetail = {
  id: 1,
  event: {
    id: 7,
    tags: [],
    created: "2022-10-14T16:19:26.637000Z",
    lastModified: "2022-10-14T16:19:26.637000Z",
    UUID: "431afec6-3898-11ed-b748-78d00429ea3e",
    creator: 1,
    modifiedBy: null,
    secondary_events: [],
    related_objects: [
      {
        url: "/jobs/1/",
        object: "Job",
      },
      {
        url: "/jobstatus/1/",
        object: "Job Status",
      },
    ],
    related_files: [],
  },
  schema: {
    id: 1,
    created: "2022-10-21T23:34:36.535000Z",
    lastModified: "2022-10-21T23:34:36.535000Z",
    schema: {
      type: "object",
      properties: {
        targets: {
          type: "array",
          items: {
            type: "string",
            pattern: "^(master|((robot|stereo)\\d+))$",
          },
        },
      },
      required: ["targets"],
    },
    version: "1.0",
    comment: "Test schema",
    creator: 1,
    modifiedBy: null,
    jobtype: "test",
  },
  target: {
    id: 4,
    created: "2022-04-26T10:07:18.334000Z",
    lastModified: "2022-04-26T10:07:18.334000Z",
    harv_id: 1,
    name: "dev",
    is_emulator: false,
    thingName: "dev-dev001",
    creator: 2,
    modifiedBy: null,
    fruit: 2,
    location: 2,
    release: null,
    harvester_history: "/harvesterhistory/?harv_id=1",
    version_history: "versions/",
    assets: "assets/",
    config: "config/",
  },
  creator: {
    id: 1,
    username: "aft",
  },
  modifiedBy: null,
  created: "2022-10-21T23:35:49.687000Z",
  lastModified: "2022-10-21T23:43:16.630000Z",
  payload: {
    targets: ["master", "robot01"],
    id: "183a3ab2-5199-11ed-8eb4-7b94730d4c5d",
    job_type: "test",
    timeout: 6000,
  },
  jobstatus: "Success",
  results:
    "/api/v1/jobresults/?job__target__harv_id=1&job__event__UUID=431afec6-3898-11ed-b748-78d00429ea3e",
  history: "/api/v1/harvjobs/1/history/",
};
