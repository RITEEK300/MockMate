# Upgrade Plan: MockMate_Interview-main (20260523075005)

- **Generated**: 2026-05-23 07:50:05
- **HEAD Branch**: N/A
- **HEAD Commit ID**: N/A

## Available Tools

**JDKs**
- Java 21.0.1: C:\Program Files\Java\jdk-21\bin (required by steps 1, 3, 4)
- Java 25.0.2: C:\Users\Dell\.jdks\openjdk-25.0.2\bin (available, not required)
- Java 17: not available (baseline will be skipped)

**Build Tools**
- Maven 3.9.12: C:\Program Files\apache-maven-3.9.12\bin
- Maven Wrapper: none detected

## Guidelines

> Note: Upgrade Java runtime to the latest LTS version for the backend module while preserving the existing Spring Boot 3.3.5 dependency set and minimizing unrelated changes.

## Options

- Working branch: appmod/java-upgrade-20260523075005
- Run tests before and after the upgrade: true

## Upgrade Goals

- Java 21

## Technology Stack

| Technology/Dependency | Current | Min Compatible | Why Incompatible |
| --------------------- | ------- | -------------- | ---------------------------------------------- |
| Java | 17 | 21 | User requested latest LTS runtime |
| Spring Boot | 3.3.5 | 3.3.5 | Already compatible with Java 21 |
| Maven | n/a | 3.9.0 | Java 21 requires Maven 3.9+ |
| spring-boot-starter-parent | 3.3.5 | 3.3.5 | Supports Java 21 and manages compiler plugins |

## Derived Upgrades

- Upgrade `backend/pom.xml` `<java.version>` from `17` to `21` because the project is already on Spring Boot 3.3.5, and the runtime goal is Java 21.
- No Spring Boot or dependency version changes are required for this runtime upgrade.
- No Maven wrapper changes are required because the project does not include a wrapper; the installed Maven 3.9.12 is compatible with Java 21.

## Impact Analysis

### Dependency Changes

| File | Dependency | Current | Action | Target | Reason |
|------|------------|---------|--------|--------|--------|
| backend/pom.xml | `java.version` | 17 | upgrade | 21 | Align build source/target with latest LTS runtime |

### Source Code Changes

No source code changes are expected for this upgrade.

### Configuration Changes

| File | Property/Setting | Current | Required Change | Reason |
|------|------------------|---------|-----------------|--------|
| backend/pom.xml | `<java.version>` | 17 | 21 | Ensure Maven compiles against Java 21 |

### CI/CD Changes

No CI/CD files were identified that require updates for this upgrade. The backend `Dockerfile` already uses Java 21 runtime images.

### Risks & Warnings

- **Baseline JDK unavailable**: Local JDK 17 is not installed, so a pre-upgrade baseline run under the original runtime cannot be performed. Mitigation: skip baseline and verify the project thoroughly with Java 21 after the upgrade.
- **Runtime behavior change**: Java 21 may expose stricter access checks or JDK runtime behavior differences. Mitigation: run the full Maven test suite and inspect any failures before completing the upgrade.

## Upgrade Steps

- Step 1: Setup Environment
  - **Rationale**: Confirm the required Java 21 runtime and compatible Maven 3.9+ are available before changing source configuration.
  - **Changes to Make**: Validate JDK and Maven availability for the upgrade.
  - **Verification**: `java -version && mvn -version` using Java 21, expected success.

- Step 2: Setup Baseline
  - **Rationale**: Establish whether a baseline with the original runtime is available. It is not, because Java 17 is not installed locally.
  - **Changes to Make**: Skip baseline and record the limitation.
  - **Verification**: No command; record skipped status due to missing Java 17.

- Step 3: Upgrade Java runtime target
  - **Rationale**: Apply the runtime upgrade in the Maven build configuration and verify the project still compiles under Java 21.
  - **Changes to Make**: Update `backend/pom.xml` `<java.version>` from `17` to `21`.
  - **Verification**: `mvn -f backend/pom.xml clean test-compile -q` using Java 21, expected success.

- Step 4: Final Validation
  - **Rationale**: Ensure the runtime upgrade is fully valid by running the complete test suite under Java 21.
  - **Changes to Make**: None beyond verification; fix any issues uncovered by tests.
  - **Verification**: `mvn -f backend/pom.xml clean test -q` using Java 21, expected full pass.
