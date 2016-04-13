import { BookData } from "./interfaces";
import { OPDSEntry } from "opds-feed-parser";

export default function adapter(data: OPDSEntry): BookData {
  let hideLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/hide";
  });

  let restoreLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/restore";
  });

  let refreshLink = data.links.find(link => {
    return link.rel === "http://librarysimplified.org/terms/rel/refresh";
  });

  let editLink = data.links.find(link => {
    return link.rel === "edit";
  });

  let issuesLink = data.links.find(link => {
    return link.rel === "issues";
  });

  return {
    title: data.title,
    summary: data.summary.content,
    publisher: data.publisher,
    hideLink: hideLink,
    restoreLink: restoreLink,
    refreshLink: refreshLink,
    editLink: editLink,
    issuesLink: issuesLink
  };
}
