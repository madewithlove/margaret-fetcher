# CHANGELOG

## 0.8.0 (Unreleased)
### Added
- Added `setMiddlewares`, `withMiddleware` and `withoutMiddlewares`

### Changed
- The `middleware` property has been renamed to `middlewares`
- The `includes` property has been deprecated in favor of using the query parameters methods

## 0.7.3
### Fixed
- Support partial root urls

## 0.7.2
### Fixed
- Missing JsonRequest export

## 0.7.1
### Fixed
- Export helpers and middlewares as well

## 0.7.0
### Changed
- Split middlewares into separate modules
- A new `JsonRequest` was added, `AbstractRequest` is now only a plain request

### Fixed
- Ignore empty responses when parsing JSON

## 0.6.0
### Added
- Add ability to use callables as options

## 0.5.3
### Fixed
- Support for Node 6

## 0.5.2
### Fixed
- Don't bundle in `fetch` module

## 0.5.1
### Added
- Add support for array query parameters

## 0.5.0
### Added
- Add ability to make raw fetch requests

## 0.4.0
### Added
- Add query parameter support

## 0.3.0
### Added
- Add ability to add middlewares.

## 0.2.6
### Added
- Add withBearerToken shortcut

## 0.2.5
### Added
- Pass response data to error handler when available
- Able to recover from errors in application code

## 0.2.4
### Fixed
- Fix recursive merge not cloning

## 0.2.3
### Added
- Fixed some error handling issues
- Use `response.ok` to check response status

## 0.2.2
### Added
- Added some error handling

## 0.2.1
### Fixed
- Leftover console log

## 0.2.0
### Added
- Add withOptions and setOptions

## 0.1.4
### Added
- Don't commit compiled files

## 0.1.3
### Fixed
- Fixed some issues with dist files

## 0.1.2
### Fixed
- Fixed incorrect exports

## 0.1.1
### Added
- Added production build

## 0.1.0
### Added
- Initial release
