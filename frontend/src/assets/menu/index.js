export const menu = [
  {
    name: "ErrorReport",
    icon: "errorreport",
    description: "Errors reports generated by harvesters",
    href: "/errorreports",
  },
  {
    name: "Notifications",
    icon: "notification",
    description: "Notification definitions",
    href: "/notifications",
  },
  {
    name: "Harvester",
    icon: "harvester",
    description: "Harvester deployed in the farm",
    href: "/harvesters",
  },
  {
    name: "Location",
    icon: "location",
    description: "Locations (Ranches) for the harvesters",
    href: "/locations",
  },
  {
    name: "Distributors",
    icon: "distributor",
    description: "Distributors for the harvesters",
    href: "/distributors",
  },
  {
    name: "AFT Releases",
    icon: "harvdeploy",
    description: "AFT releases available for the harvester",
    href: "/release",
  },
  {
    name: "Harvester History",
    icon: "history",
    description: "Harvester historical data",
    href: "/harvesterhistory",
  },
  {
    name: "Events",
    icon: "events",
    description: "Events linking various models as they occur",
    href: "/events",
  },
  {
    name: "Job Scheduler",
    icon: "version",
    description: "Schedule jobs on the harvesters",
    href: "/jobscheduler",
  },
  {
    name: "Scheduled Jobs",
    icon: "jobs",
    description: "Scheduled jobs on the harvesters",
    href: "/jobs",
  },
  {
    name: "Aftvplus",
    icon: "logparser",
    description: "Log entries captured from harvesters",
    href: "/logsession",
  },
  {
    name: "S3Files",
    icon: "awss3",
    description: "Files uploaded to aws s3 bucket",
    href: "/s3files",
  },
  {
    name: "Autodiagnostics",
    icon: "autodiag",
    description: "Auto-diagnostic report from harvesters",
    href: "/autodiagnostics",
  },
  {
    name: "Emulator Report",
    icon: "emustats",
    description: "Emulator statistics report & graphs",
    href: "/emustats",
  },
];

export const adminMenu = [
  ...menu,
  {
    name: "Users",
    icon: "users",
    description: "Users registered in the system (developers)",
    href: "/users",
  },
];
