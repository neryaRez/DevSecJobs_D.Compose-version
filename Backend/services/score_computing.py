# services/score_computing.py
from Models.applicant import Applicant
from Models.job import Job

def compute_application_score(applicant_id: int, job_id: int) -> int | None:

    applicant = Applicant.query.get(applicant_id)
    job = Job.query.get(job_id)

    if not applicant or not job:
        return None

    score = 0

    # ניסיון
    if applicant.years_experience and job.required_experience:
        if applicant.years_experience >= job.required_experience:
            score += 30
        else:
            score += (applicant.years_experience / job.required_experience) * 30

    # טכנולוגיות
    if applicant.technologies and job.required_technologies:
        applicant_techs = set(map(str.strip, applicant.technologies.split(',')))
        job_techs = set(map(str.strip, job.required_technologies.split(',')))
        if job_techs:
            matching_techs = applicant_techs.intersection(job_techs)
            score += (len(matching_techs) / len(job_techs)) * 50

    if applicant.education:
        if "PhD" in applicant.education:
            score += 20
        elif "Master" in applicant.education:
            score += 15
        elif "Bachelor" in applicant.education:
            score += 10

    return score
